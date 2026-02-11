import type { SVGProps } from 'react';

export function HandThumbUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M2.25 10.5h4.5v10.5h-4.5V10.5Zm4.5 0 3.136-7.024A1.875 1.875 0 0 1 11.598 2.25h.352c1.036 0 1.875.84 1.875 1.875v2.25h5.237a2.25 2.25 0 0 1 2.208 2.684l-1.2 6A2.25 2.25 0 0 1 17.864 17.25H6.75V10.5Z" />
    </svg>
  );
}

export function HandThumbDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.75 13.5h-4.5V3h4.5v10.5Zm-4.5 0-3.136 7.024a1.875 1.875 0 0 1-1.712 1.226h-.352a1.875 1.875 0 0 1-1.875-1.875v-2.25H4.938a2.25 2.25 0 0 1-2.208-2.684l1.2-6A2.25 2.25 0 0 1 6.136 6.75H17.25v6.75Z" />
    </svg>
  );
}
