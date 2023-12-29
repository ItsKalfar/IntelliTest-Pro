import { ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import { UserButton, auth } from "@clerk/nextjs";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

const MobileNav = async () => {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className="sm:hidden">
      <Drawer>
        <DrawerTrigger>
          <Menu className="relative z-50 h-5 w-5 text-zinc-700" />
        </DrawerTrigger>
        <DrawerContent>
          {isAuth ? (
            <ul className="px-10 pt-20 pb-8">
              <li>
                <Link
                  className="flex items-center w-full font-semibold"
                  href="/sign-up"
                >
                  Get started
                </Link>
                <Separator className="my-4" />
              </li>
              <li>
                <Link
                  className="flex items-center w-full font-semibold"
                  href="/sign-in"
                >
                  Sign in
                </Link>
                <Separator className="my-4" />
              </li>
              <li>
                <Link
                  className="flex items-center w-full font-semibold"
                  href="/pricing"
                >
                  Pricing
                </Link>
                <Separator className="my-4" />
              </li>
            </ul>
          ) : (
            <>
              <ul className="px-10 pt-20 pb-8">
                <li>
                  <UserButton afterSignOutUrl="/" />
                </li>
                <li>
                  <Link
                    className="flex items-center w-full font-semibold"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                  <Separator className="my-4" />
                </li>
                <li>
                  <Link
                    className="flex items-center w-full font-semibold"
                    href="/pricing"
                  >
                    Manage Subscriptions
                  </Link>
                  <Separator className="my-4" />
                </li>
              </ul>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileNav;
