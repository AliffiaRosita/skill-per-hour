import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/shared/navbar/Navbar";
import StreamVideoProvider from "@/context/StreamClientProvider";
import { getStreamUserData, getUserById } from "@/lib/actions/user.action";
import { streamTokenProvider } from "@/lib/actions/stream.actions";

const Layout = async ({ children }: { children: React.ReactNode }) => {
	const { userId } = auth();

	if (!userId) return null;

	const mongoUser = await getUserById({ userId });

	if (!mongoUser?.onboarded) redirect("/onboarding");

	const streamUser = await getStreamUserData({ userId });

	if (!streamUser) return redirect('/sign-in');

	const streamToken = await streamTokenProvider(userId);

	if (!streamToken) return redirect('/home');

	return (
		<main className="background-light850_dark100 relative">
			<Navbar />
			<div className="flex">
				<section className="flex max-h-screen min-h-screen flex-1 flex-col px-4 pb-6 pt-36 max-md:pb-14 sm:px-14">
					<div className="mx-auto size-full">
						<StreamVideoProvider streamUser={streamUser} streamToken={streamToken}>{children}</StreamVideoProvider>
					</div>
				</section>
			</div>

			<Toaster />
		</main>
	);
};

export default Layout;
