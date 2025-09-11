import Image from "next/image";
import { Link } from "@/components/Link";

const Logo = () => {
  return (
    <Link href="/">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={40}
        height={40}
        className="w-24 h-auto"
        priority
      />
    </Link>
  );
};

export default Logo;
