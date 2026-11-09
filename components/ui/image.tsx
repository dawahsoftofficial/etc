import NextImage, { type ImageProps } from "next/image";

/**
 * next/image, except files from public/ skip the optimizer. Its internal fetch of a local file carries no headers, so
 * the private-preview login gate would refuse it and the image would break. Spaces images are still optimized.
 */
export default function Image(props: ImageProps) {
  const local = typeof props.src === "string" && props.src.startsWith("/");
  return <NextImage {...props} unoptimized={props.unoptimized || local} />;
}
