import Image from "next/image";
export function Footer() {

  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center my-4">
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-openxpand"
        href={"https://developer.openxpand.com"}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/globe.svg"
          alt="Globe icon"
          width={16}
          height={16}
        />
        Go to developer portal →
      </a>
    </footer>
  );
}
