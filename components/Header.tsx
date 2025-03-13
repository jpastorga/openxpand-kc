import Image from "next/image";

export function Header() {
  return (
    <header className="pl-6 pt-[0.8rem]">
      <Image className="dark:invert" src="/logo.svg" alt="Next.js logo" width={192} height={33} priority />
    </header>
  );
}
