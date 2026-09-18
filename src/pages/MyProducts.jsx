import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import supabase from '../lib/supabase';

import {
  MAX_LISTING_IMAGES,
  optimizeListingImage,
  validateListingFiles,
} from '../lib/imageProcessing';

import {
  accountFieldValue,
  clashHeroSummary,
  gameLabel,
  getAccountFields,
  itemCategories,
  listingTypes,
  marketplaceGames,
  platforms,
  regions,
  serviceCategories,
} from '../lib/listingOptions';

import '../styles/my-products.css';


const inputClass = 'my-products-input';


const money = (value) =>
  `₹${Number(
    value || 0
  ).toLocaleString('en-IN')}`;


const storagePath = (url) =>
  url?.includes(
    '/account-images/'
  )
    ? decodeURIComponent(
        url.split(
          '/account-images/'
        )[1]
      )
    : null;


async function uploadImage(
  file,
  userId,
  gameId
) {
  const { full, thumbnail } =
    await optimizeListingImage(
      file
    );


  const key =
    crypto.randomUUID();


  const fullPath =
    `${userId}/${gameId}/${key}.webp`;


  const thumbnailPath =
    `${userId}/${gameId}/thumbnails/${key}.webp`;


  const bucket =
    supabase.storage.from(
      'account-images'
    );


  const {
    error: fullError,
  } =
    await bucket.upload(
      fullPath,
      full,
      {
        cacheControl:
          '31536000',
        contentType:
          'image/webp',
      }
    );


  if (fullError) {
    throw fullError;
  }


  const {
    error: thumbnailError,
  } =
    await bucket.upload(
      thumbnailPath,
      thumbnail,
      {
        cacheControl:
          '31536000',
        contentType:
          'image/webp',
      }
    );


  if (thumbnailError) {
    await bucket.remove([
      fullPath,
    ]);

    throw thumbnailError;
  }


  return {
    paths: [
      fullPath,
      thumbnailPath,
    ],

    url:
      bucket.getPublicUrl(
        fullPath
      ).data.publicUrl,

    thumbnail:
      bucket.getPublicUrl(
        thumbnailPath
      ).data.publicUrl,
  };
}


export default function MyProducts() {
  const navigate =
    useNavigate();

  const [user, setUser] =
    useState(null);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editor, setEditor] =
    useState(null);

  const [notice, setNotice] =
    useState('');

  const [query, setQuery] =
    useState('');

  const [
    typeFilter,
    setTypeFilter,
  ] = useState('all');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');


  const load = useCallback(
    async (userId) => {
      const [
        { data: seller },
        {
          data: inventory,
          error,
        },
      ] = await Promise.all([
        supabase
          .from(
            'seller_profiles'
          )
          .select('status')
          .eq(
            'user_id',
            userId
          )
          .maybeSingle(),

        supabase
          .from('accounts')
          .select('*')
          .eq(
            'seller_id',
            userId
          )
          .order(
            'created_at',
            {
              ascending: false,
            }
          ),
      ]);


      if (
        !seller ||
        seller.status !==
          'approved'
      ) {
        navigate(
          '/become-a-seller',
          {
            replace: true,
          }
        );

        return;
      }


      if (error) {
        setNotice(
          error.message
        );
      }


      setProducts(
        inventory || []
      );

      setLoading(false);
    },
    [navigate]
  );


  useEffect(() => {
    let active = true;


    supabase.auth
      .getSession()
      .then(
        ({
          data: {
            session,
          },
        }) => {
          if (!active) {
            return;
          }


          if (!session?.user) {
            navigate(
              '/login',
              {
                replace: true,
              }
            );

            return;
          }


          setUser(
            session.user
          );


          load(
            session.user.id
          );
        }
      );


    return () => {
      active = false;
    };
  }, [load, navigate]);


  const visibleProducts =
    useMemo(
      () =>
        products.filter(
          (product) => {
            const search =
              query
                .trim()
                .toLowerCase();


            const matchesQuery =
              !search ||
              [
                product.title,
                product.game_id,
                product.listing_type,
                ...Object.values(
                  product.attributes ||
                    {}
                ),
              ].some(
                (value) =>
                  String(
                    value || ''
                  )
                    .toLowerCase()
                    .includes(
                      search
                    )
              );


            return (
              matchesQuery &&
              (
                typeFilter ===
                  'all' ||
                (
                  product.listing_type ||
                  'account'
                ) ===
                  typeFilter
              ) &&
              (
                statusFilter ===
                  'all' ||
                (
                  statusFilter ===
                  'review'
                    ? product.moderation_status ===
                      'pending'
                    : product.status ===
                      statusFilter
                )
              )
            );
          }
        ),
      [
        products,
        query,
        statusFilter,
        typeFilter,
      ]
    );


  async function saveProduct(
    event,
    listingType,
    gameId,
    product
  ) {
    event.preventDefault();


    const form =
      event.currentTarget;


    const files =
      Array.from(
        form.images.files ||
          []
      );


    const existingUrls =
      product?.image_urls
        ?.length
        ? product.image_urls
        : [
            product?.image_url,
          ].filter(Boolean);


    const existingThumbnails =
      product?.thumbnail_urls
        ?.length
        ? product.thumbnail_urls
        : [
            product?.thumbnail_url,
          ].filter(Boolean);


    const validation =
      validateListingFiles(
        files,
        existingUrls.length
      );


    if (
      (
        !product &&
        !files.length
      ) ||
      validation
    ) {
      setNotice(
        validation ||
          'Choose at least one product image.'
      );

      return;
    }


    setSaving(true);

    setNotice('');


    const uploadedPaths = [];

    const urls = [
      ...existingUrls,
    ];

    const thumbnails = [
      ...existingThumbnails,
    ];


    try {
      for (const file of files) {
        const image =
          await uploadImage(
            file,
            user.id,
            gameId
          );


        uploadedPaths.push(
          ...image.paths
        );

        urls.push(
          image.url
        );

        thumbnails.push(
          image.thumbnail
        );
      }


      const value = (name) =>
        form.elements
          .namedItem(name)
          ?.value?.trim() ||
        '';


      let attributes;


      if (
        listingType ===
        'account'
      ) {
        attributes = {
          access:
            value('access'),
        };


        getAccountFields(
          gameId
        ).forEach(
          (field) => {
            const raw =
              value(
                field.key
              );


            attributes[
              field.key
            ] =
              field.type ===
              'number'
                ? Number(
                    raw
                  ) || null
                : raw ||
                  null;
          }
        );

      } else if (
        listingType ===
        'item'
      ) {
        attributes = {
          item_name:
            value(
              'itemName'
            ),

          item_category:
            value(
              'itemCategory'
            ),

          quantity:
            Number(
              value(
                'quantity'
              )
            ) || 1,
        };

      } else {
        attributes = {
          service_name:
            value(
              'serviceName'
            ),

          service_category:
            value(
              'serviceCategory'
            ),

          estimated_days:
            Number(
              value(
                'estimatedDays'
              )
            ) || 1,

          requirements:
            value(
              'requirements'
            ) || null,
        };
      }


      const deliveryMethod =
        listingType ===
        'service'
          ? 'scheduled'
          : value(
              'deliveryMethod'
            );


      const primaryAccountField =
        listingType ===
        'account'
          ? getAccountFields(
              gameId
            ).find(
              (field) =>
                field.type ===
                'number'
            )
          : null;


      const payload = {
        seller_id:
          user.id,

        game_id:
          gameId,

        title:
          value('title'),

        listing_type:
          listingType,

        delivery_method:
          deliveryMethod,

        platform:
          value('platform'),

        region:
          value('region'),

        attributes,

        town_hall:
          primaryAccountField
            ? Number(
                attributes[
                  primaryAccountField
                    .key
                ]
              ) || null
            : null,

        builder_hall:
          listingType ===
          'account'
            ? Number(
                attributes.builder_hall
              ) || null
            : null,

        exp_level:
          listingType ===
          'account'
            ? Number(
                attributes.experience_level ||
                attributes.account_level ||
                attributes.trainer_level ||
                attributes.farm_level
              ) || null
            : null,

        gems:
          listingType ===
          'account'
            ? Number(
                attributes.gems ||
                attributes.diamonds ||
                attributes.v_bucks ||
                attributes.coins
              ) || null
            : null,

        heroes_level:
          listingType ===
          'account'
            ? clashHeroSummary(
                attributes
              ) ||
              attributes.rare_skins ||
              null
            : null,

        walls_level:
          listingType ===
          'account'
            ? attributes.walls_level ||
              attributes.rank ||
              attributes.highest_rank ||
              null
            : null,

        full_email_access:
          listingType ===
            'account' &&
          value('access') ===
            'Full email access',

        instant_delivery:
          deliveryMethod ===
          'instant',

        price:
          Number(
            value('price')
          ),

        original_price:
          Number(
            value(
              'originalPrice'
            )
          ) || null,

        description:
          value(
            'description'
          ) || null,

        image_url:
          urls[0],

        image_urls:
          urls,

        thumbnail_url:
          thumbnails[0] ||
          urls[0],

        thumbnail_urls:
          thumbnails.length
            ? thumbnails
            : urls,

        status:
          product?.status ||
          'available',

        moderation_status:
          'pending',
      };


      const operation =
        product
          ? supabase
              .from(
                'accounts'
              )
              .update(
                payload
              )
              .eq(
                'id',
                product.id
              )
              .eq(
                'seller_id',
                user.id
              )
              .select()
              .single()

          : supabase
              .from(
                'accounts'
              )
              .insert(
                payload
              )
              .select()
              .single();


      const { error } =
        await operation;


      if (error) {
        throw error;
      }


      setEditor(null);


      setNotice(
        product
          ? 'Product updated and sent for approval again.'
          : 'Product created and sent for approval.'
      );


      await load(
        user.id
      );

    } catch (error) {
      if (
        uploadedPaths.length
      ) {
        await supabase.storage
          .from(
            'account-images'
          )
          .remove(
            uploadedPaths
          );
      }


      setNotice(
        error.message ||
          'Could not save this product.'
      );

    } finally {
      setSaving(false);
    }
  }


  async function deleteProduct(
    product
  ) {
    if (
      product.status ===
        'sold' ||
      !window.confirm(
        `Delete “${
          product.title ||
          'this product'
        }”? This cannot be undone.`
      )
    ) {
      return;
    }


    setSaving(true);

    setNotice('');


    const { error } =
      await supabase
        .from('accounts')
        .delete()
        .eq(
          'id',
          product.id
        )
        .eq(
          'seller_id',
          user.id
        );


    if (error) {
      setNotice(
        error.message
      );

    } else {
      const urls = [
        ...(
          product.image_urls ||
          []
        ),

        ...(
          product.thumbnail_urls ||
          []
        ),

        product.image_url,

        product.thumbnail_url,
      ].filter(Boolean);


      const paths = [
        ...new Set(
          urls
            .map(
              storagePath
            )
            .filter(Boolean)
        ),
      ];


      if (paths.length) {
        await supabase.storage
          .from(
            'account-images'
          )
          .remove(paths);
      }


      setNotice(
        'Product deleted.'
      );


      await load(
        user.id
      );
    }


    setSaving(false);
  }


  if (loading) {
    return (
      <main className="my-products-loading-page">

        <div className="my-products-loading-card" />

      </main>
    );
  }


  return (
    <main className="my-products-page">

      <div className="my-products-container">


        {/* HEADER */}

        <div className="my-products-header">

          <div>

            <p className="my-products-kicker">
              Verified seller inventory
            </p>


            <h1 className="my-products-title">
              My products
            </h1>


            <p className="my-products-description">
              Create and manage your
              accounts, items and
              services.
            </p>

          </div>


          <div className="my-products-header-actions">

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/seller'
                )
              }
              className="my-products-dashboard-button"
            >
              Seller dashboard
            </button>


            <button
              type="button"
              onClick={() =>
                setEditor({
                  mode: 'create',
                })
              }
              className="my-products-create-button"
            >
              + Create product
            </button>

          </div>

        </div>


        {notice && (

          <div className="my-products-notice">
            {notice}
          </div>

        )}


        {/* INVENTORY */}

        <section className="my-products-panel">

          <div className="my-products-panel-header">

            <div>

              <h2 className="my-products-panel-title">
                Your inventory
              </h2>


              <p className="my-products-panel-count">

                {visibleProducts.length}
                {' '}of{' '}
                {products.length}
                {' '}products

              </p>

            </div>


            <div className="my-products-filters">

              <input
                value={query}
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Search products"
                className="my-products-search"
              />


              <select
                value={
                  typeFilter
                }
                onChange={(
                  event
                ) =>
                  setTypeFilter(
                    event.target
                      .value
                  )
                }
                className="my-products-select"
              >

                <option value="all">
                  All types
                </option>


                {listingTypes.map(
                  ([
                    id,
                    label,
                  ]) => (

                    <option
                      key={id}
                      value={id}
                    >
                      {label}s
                    </option>

                  )
                )}

              </select>


              <select
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target
                      .value
                  )
                }
                className="my-products-select"
              >

                <option value="all">
                  All status
                </option>

                <option value="available">
                  Available
                </option>

                <option value="sold">
                  Sold
                </option>

                <option value="review">
                  Under review
                </option>

              </select>

            </div>

          </div>


          {visibleProducts.length ? (

            <div className="my-products-list">

              {visibleProducts.map(
                (product) => {

                  const statusClass =
                    product.status ===
                    'sold'
                      ? 'my-product-status my-product-status-sold'
                      : product.moderation_status ===
                          'approved'
                        ? 'my-product-status my-product-status-approved'
                        : product.moderation_status ===
                            'rejected'
                          ? 'my-product-status my-product-status-rejected'
                          : 'my-product-status my-product-status-pending';


                  return (
                    <article
                      key={
                        product.id
                      }
                      className="my-product-row"
                    >

                      <div className="my-product-main">

                        <img
                          src={
                            product.thumbnail_url ||
                            product.image_url
                          }
                          alt=""
                          className="my-product-image"
                        />


                        <div className="my-product-copy">

                          <div className="my-product-title-row">

                            <h3 className="my-product-title">

                              {product.title ||
                                `${gameLabel(
                                  product.game_id
                                )} product`}

                            </h3>


                            <span className="my-product-type">

                              {product.listing_type ||
                                'account'}

                            </span>

                          </div>


                          <p className="my-product-meta">

                            {gameLabel(
                              product.game_id
                            )}

                            {' · '}

                            {money(
                              product.price
                            )}

                          </p>


                          <span className={statusClass}>

                            {product.status ===
                            'sold'
                              ? 'Sold'
                              : product.moderation_status}

                          </span>

                        </div>

                      </div>


                      <div className="my-product-actions">

                        <button
                          type="button"
                          disabled={
                            product.status ===
                            'sold'
                          }
                          onClick={() =>
                            setEditor(
                              {
                                mode:
                                  'edit',
                                product,
                              }
                            )
                          }
                          className="my-product-edit"
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          disabled={
                            saving ||
                            product.status ===
                              'sold'
                          }
                          onClick={() =>
                            deleteProduct(
                              product
                            )
                          }
                          className="my-product-delete"
                        >
                          Delete
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          ) : (

            <div className="my-products-empty">

              <p className="my-products-empty-title">
                No products found
              </p>


              <p className="my-products-empty-text">
                Create your first
                product or change the
                filters.
              </p>

            </div>

          )}

        </section>


        {editor && (

          <ProductEditor
            key={
              editor.product
                ?.id ||
              'new'
            }
            product={
              editor.product
            }
            saving={saving}
            onClose={() =>
              setEditor(null)
            }
            onSave={
              saveProduct
            }
          />

        )}

      </div>

    </main>
  );
}


function ProductEditor({
  product,
  saving,
  onClose,
  onSave,
}) {
  const [
    listingType,
    setListingType,
  ] = useState(
    product?.listing_type ||
      'account'
  );


  const [
    gameId,
    setGameId,
  ] = useState(
    product?.game_id ||
      'clash-of-clans'
  );


  const attributes =
    product?.attributes ||
    {};


  return (
    <div
      className="product-editor-overlay"
      onMouseDown={onClose}
    >

      <form
        onSubmit={(event) =>
          onSave(
            event,
            listingType,
            gameId,
            product
          )
        }
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="product-editor-modal"
      >

        {/* HEADER */}

        <div className="product-editor-header">

          <div>

            <p className="product-editor-kicker">
              Verified seller
            </p>


            <h2 className="product-editor-title">

              {product
                ? 'Edit product'
                : 'Create product'}

            </h2>


            <p className="product-editor-description">
              Game-specific fields help
              buyers compare listings
              accurately.
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="product-editor-close"
          >
            ×
          </button>

        </div>


        {/* PRODUCT TYPE */}

        <div className="product-editor-types">

          {listingTypes.map(
            ([id, label]) => (

              <button
                key={id}
                type="button"
                onClick={() =>
                  setListingType(
                    id
                  )
                }
                className={
                  listingType ===
                  id
                    ? 'product-editor-type active'
                    : 'product-editor-type'
                }
              >
                {label}
              </button>

            )
          )}

        </div>


        <div className="product-editor-grid">


          {/* GAME */}

          <Field label="Game *">

            <select
              name="game"
              value={gameId}
              onChange={(
                event
              ) =>
                setGameId(
                  event.target
                    .value
                )
              }
              className={
                inputClass
              }
            >

              {marketplaceGames.map(
                ([id, name]) => (

                  <option
                    key={id}
                    value={id}
                  >
                    {name}
                  </option>

                )
              )}

            </select>

          </Field>


          {/* TITLE */}

          <Field label="Listing title *">

            <input
              name="title"
              required
              maxLength="100"
              defaultValue={
                product?.title ||
                ''
              }
              placeholder="Clear product title"
              className={
                inputClass
              }
            />

          </Field>


          {/* PLATFORM */}

          <Field label="Platform *">

            <select
              name="platform"
              required
              defaultValue={
                product?.platform ||
                'Any platform'
              }
              className={
                inputClass
              }
            >

              {platforms.map(
                (value) => (

                  <option
                    key={value}
                  >
                    {value}
                  </option>

                )
              )}

            </select>

          </Field>


          {/* REGION */}

          <Field label="Region *">

            <select
              name="region"
              required
              defaultValue={
                product?.region ||
                'Global'
              }
              className={
                inputClass
              }
            >

              {regions.map(
                (value) => (

                  <option
                    key={value}
                  >
                    {value}
                  </option>

                )
              )}

            </select>

          </Field>


          {/* ACCOUNT FIELDS */}

          {listingType ===
            'account' && (
            <>

              <Field label="Account access *">

                <select
                  name="access"
                  required
                  defaultValue={
                    attributes.access ||
                    (
                      product?.full_email_access
                        ? 'Full email access'
                        : 'Game login only'
                    )
                  }
                  className={
                    inputClass
                  }
                >

                  <option>
                    Full email access
                  </option>

                  <option>
                    Game login only
                  </option>

                  <option>
                    Transfer assistance
                  </option>

                </select>

              </Field>


              {getAccountFields(
                gameId
              ).map(
                (field) => (

                  <Field
                    key={`${gameId}-${field.key}`}
                    label={`${field.label}${
                      field.required
                        ? ' *'
                        : ''
                    }`}
                  >

                    <input
                      name={
                        field.key
                      }
                      type={
                        field.type
                      }
                      min={
                        field.type ===
                        'number'
                          ? 0
                          : undefined
                      }
                      required={
                        field.required
                      }
                      defaultValue={accountFieldValue(
                        product,
                        field.key
                      )}
                      placeholder={
                        field.placeholder
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                )
              )}

            </>
          )}


          {/* ITEM FIELDS */}

          {listingType ===
            'item' && (
            <>

              <Field label="Item name *">

                <input
                  name="itemName"
                  required
                  defaultValue={
                    attributes.item_name ||
                    ''
                  }
                  className={
                    inputClass
                  }
                />

              </Field>


              <Field label="Item category *">

                <select
                  name="itemCategory"
                  required
                  defaultValue={
                    attributes.item_category ||
                    'Currency'
                  }
                  className={
                    inputClass
                  }
                >

                  {itemCategories.map(
                    (value) => (

                      <option
                        key={
                          value
                        }
                      >
                        {value}
                      </option>

                    )
                  )}

                </select>

              </Field>


              <Field label="Quantity *">

                <input
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  defaultValue={
                    attributes.quantity ||
                    1
                  }
                  className={
                    inputClass
                  }
                />

              </Field>

            </>
          )}


          {/* SERVICE FIELDS */}

          {listingType ===
            'service' && (
            <>

              <Field label="Service name *">

                <input
                  name="serviceName"
                  required
                  defaultValue={
                    attributes.service_name ||
                    ''
                  }
                  className={
                    inputClass
                  }
                />

              </Field>


              <Field label="Service category *">

                <select
                  name="serviceCategory"
                  required
                  defaultValue={
                    attributes.service_category ||
                    'Rank boost'
                  }
                  className={
                    inputClass
                  }
                >

                  {serviceCategories.map(
                    (value) => (

                      <option
                        key={
                          value
                        }
                      >
                        {value}
                      </option>

                    )
                  )}

                </select>

              </Field>


              <Field label="Estimated completion (days) *">

                <input
                  name="estimatedDays"
                  type="number"
                  min="1"
                  max="90"
                  required
                  defaultValue={
                    attributes.estimated_days ||
                    1
                  }
                  className={
                    inputClass
                  }
                />

              </Field>


              <Field label="Buyer requirements">

                <input
                  name="requirements"
                  defaultValue={
                    attributes.requirements ||
                    ''
                  }
                  className={
                    inputClass
                  }
                />

              </Field>

            </>
          )}


          {/* DELIVERY */}

          {listingType !==
            'service' && (

            <Field label="Delivery method *">

              <select
                name="deliveryMethod"
                required
                defaultValue={
                  product?.delivery_method ||
                  'seller_delivery'
                }
                className={
                  inputClass
                }
              >

                <option value="seller_delivery">
                  Seller delivery
                </option>

                <option value="instant">
                  Instant code/details
                </option>

              </select>

            </Field>

          )}


          {listingType ===
            'service' && (

            <div className="product-editor-service-note">
              Scheduled delivery is
              used for services.
            </div>

          )}


          {/* PRICE */}

          <Field label="Price (₹) *">

            <input
              name="price"
              type="number"
              min="1"
              required
              defaultValue={
                product?.price ||
                ''
              }
              className={
                inputClass
              }
            />

          </Field>


          <Field label="Original price (₹)">

            <input
              name="originalPrice"
              type="number"
              min="1"
              defaultValue={
                product?.original_price ||
                ''
              }
              className={
                inputClass
              }
            />

          </Field>


          {/* IMAGES */}

          <Field
            label={
              product
                ? 'Add more pictures'
                : 'Product pictures *'
            }
          >

            <input
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required={
                !product
              }
              className="product-editor-file"
            />

          </Field>

        </div>


        {/* DESCRIPTION */}

        <Field
          label="Description *"
          className="product-editor-field-spaced"
        >

          <textarea
            name="description"
            rows="4"
            required
            defaultValue={
              product?.description ||
              ''
            }
            className="my-products-input my-products-textarea"
          />

        </Field>


        <p className="product-editor-help">

          Up to{' '}
          {MAX_LISTING_IMAGES}
          {' '}pictures total. Edits
          return to admin review before
          becoming visible.

        </p>


        <button
          disabled={saving}
          className="product-editor-submit"
        >

          {saving
            ? 'Saving…'
            : product
              ? 'Save and submit for review'
              : 'Create and submit for review'}

        </button>

      </form>

    </div>
  );
}


function Field({
  label,
  children,
  className = '',
}) {
  return (
    <label
      className={`product-editor-field ${className}`}
    >
      {label}

      {children}
    </label>
  );
}