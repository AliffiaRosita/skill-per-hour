"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { SignedOut } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet";

import { sidebarLinks } from "@/constants";

const NavContent = () => {
	const pathname = usePathname();

	return (
		<section className="flex h-full flex-col gap-6 pt-16">
			{sidebarLinks.map((link) => {
				const isActive: boolean =
					(pathname.includes(link.route) && link.route.length > 1) ||
					pathname === link.route;

				return (
					<SheetClose asChild key={link.route}>
						<Link
							href={link.route}
							className={`${
								isActive
									? "primary-gradient rounded-lg text-light-900"
									: "text-dark300_light900"
							} flex items-center justify-start gap-4 bg-transparent p-4`}
						>
							<Image
								src={link.imgURL}
								alt={link.label}
								width={20}
								height={20}
								className={`${isActive ? "" : "invert-colors"}`}
							/>
							<p
								className={`${isActive ? "base-bold" : "base-medium"}`}
							>
								{link.label}
							</p>
						</Link>
					</SheetClose>
				);
			})}
		</section>
	);
};

const Mobile = () => {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Image
					src="/assets/icons/hamburger.svg"
					alt="Menu"
					width={36}
					height={36}
					className="invert-colors sm:hidden"
				/>
			</SheetTrigger>
			<SheetContent
				side="left"
				className="background-light900_dark200 flex flex-col justify-between border-none"
			>
				<div className="flex flex-col">
					<Link href="/home" className="flex items-center gap-1">
						<Image
							src="/assets/images/site-logo.png"
							width={23}
							height={23}
							alt="TheSkillGuru"
						/>

						<p className="h2-bold text-dark100_light900 font-spaceGrotesk">
							The <span className="text-primary-500">SkillGuru</span>
						</p>
					</Link>
					<div>
						<SheetClose asChild>
							<NavContent />
						</SheetClose>
					</div>
				</div>
				<div className="flex flex-col gap-6">
					<SignedOut>
						<div className="flex flex-col gap-3">
							<SheetClose asChild>
								<Link href="/sign-in">
									<Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
										<span className="primary-text-gradient">
											Log In
										</span>
									</Button>
								</Link>
							</SheetClose>

							<SheetClose asChild>
								<Link href="/sign-up">
									<Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
										Sign Up
									</Button>
								</Link>
							</SheetClose>
						</div>
					</SignedOut>

					<div className="flex-center flex flex-col gap-3">
						<Link
							href="https://wa.me/919560695530"
							className="bottom-0 mt-auto"
						>
							<Button className="paragraph-medium min-h-[46px] min-w-[175px] bg-green-500 px-4 py-3 text-white">
								<FontAwesomeIcon icon={faWhatsapp} className="mr-2" />{" "}
								Help & Support
							</Button>
						</Link>
						<div className="flex flex-row text-xs text-gray-600">
								<Link
									href="/privacy-policy"
									className="bottom-0 mt-auto hover:text-primary-500"
								>
									Privacy Policy
								</Link>
								&nbsp;&&nbsp;
								<Link
									href="/terms-of-service"
									className="bottom-0 mt-auto hover:text-primary-500"
								>
									Terms of Service
								</Link>
						</div>
					</div>			
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default Mobile;
