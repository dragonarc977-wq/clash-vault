'use client';

import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import { useCallback, useEffect } from 'react';

export function Link({ to, replace, children, ...props }) {
  return (
    <NextLink href={to} replace={replace} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (destination, options = {}) => {
      if (typeof destination === 'number') {
        if (destination < 0) router.back();
        else if (destination > 0) router.forward();
        return;
      }

      if (options?.replace) router.replace(destination);
      else router.push(destination);
    },
    [router],
  );
}

export function useParams() {
  return useNextParams();
}

export function useSearchParams() {
  const params = useNextSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const setSearchParams = useCallback(
    (nextParams, options = {}) => {
      const value = typeof nextParams === 'function'
        ? nextParams(new URLSearchParams(params.toString()))
        : nextParams;
      const query = value instanceof URLSearchParams
        ? value.toString()
        : new URLSearchParams(value).toString();
      const destination = query ? `${pathname}?${query}` : pathname;

      if (options?.replace) router.replace(destination);
      else router.push(destination);
    },
    [params, pathname, router],
  );

  return [params, setSearchParams];
}

export function useLocation() {
  const pathname = usePathname();
  const search = typeof window === 'undefined' ? '' : window.location.search;
  const hash = typeof window === 'undefined' ? '' : window.location.hash;

  return { pathname, search, hash };
}

export function Navigate({ to, replace = false }) {
  const router = useRouter();

  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [replace, router, to]);

  return null;
}
