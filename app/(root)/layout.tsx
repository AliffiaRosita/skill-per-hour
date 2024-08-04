import React from 'react';

import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/shared/navbar/Navbar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import MobileFooter from '@/components/shared/footer';
// import RightSidebar from "@/components/shared/RightSidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="background-light850_dark100 relative">
            <Navbar />
            <div className="flex">
                <LeftSidebar />

                <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 min-[320px]:mb-10 sm:mb-10">
                    <div className="mx-auto w-full max-w-5xl">{children}</div>
                </section>

                <MobileFooter />

                {/* <RightSidebar /> */}
            </div>

            <Toaster />
        </main>
    );
};

export default Layout;
