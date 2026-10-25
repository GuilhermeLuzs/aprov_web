type Props = {
  src: string;
  alt: string;
};

export function PhoneMockup({ src, alt }: Props) {
  return (
    <div className="mx-auto w-full max-w-phone shrink-0 rounded-phone bg-ink p-sm shadow-phone lg:h-phone-fit lg:w-fit lg:max-w-none">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="block aspect-phone w-full rounded-phone-screen object-cover object-top lg:h-full lg:w-auto"
      />
    </div>
  );
}
