import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { Button } from '@/components/ui/button';
import LocalSearchbar from '@/components/shared/search/LocalSearchbar';
import Filter from '@/components/shared/Filter';
import Pagination from '@/components/shared/Pagination';
import HomeFilters from '@/components/shared/Filters';
import QuestionsContainer from '@/components/shared/QuestionsContainer';

import { HomePageFilters } from '@/constants/filters';

import type { SearchParamsProps } from "@/types";

import {
    getQuestions,
    getRecommendedQuestions,
} from '@/lib/actions/question.action';
import { identifyKnockUser } from '@/lib/actions/knock.action';
import { getUserById } from '@/lib/actions/user.action';
import { ImageSwiper } from '@/components/banner/banner';
// import { redirect } from 'next/navigation';

import InstantCall from "../components/InstantCall";
import { getSkillsForForm } from "@/lib/actions/skill.action";

export const metadata: Metadata = {
    title: 'Home — TheSkillGuru',
};

export default async function Home({ searchParams }: SearchParamsProps) {
    const { userId: clerkId } = auth();
    let mongoUserId;

    const mongoUser = await getUserById({ userId: clerkId });

    if (clerkId) {
        await identifyKnockUser(clerkId);
        mongoUserId = mongoUser ? mongoUser._id : null;
    }

    // if (!mongoUser?.onboarded) redirect("/onboarding");

	const skills = await getSkillsForForm();

    let result;

    if (searchParams?.filter === 'recommended') {
        if (clerkId) {
            result = await getRecommendedQuestions({
                userId: clerkId,
                searchQuery: searchParams.q,
                page: searchParams.page ? +searchParams.page : 1,
            });
        } else {
            result = {
                questions: [],
                isNext: false,
            };
        }
    } else {
        result = await getQuestions({
            searchQuery: searchParams.q,
            filter: searchParams.filter,
            page: searchParams.page ? +searchParams.page : 1,
            clerkId: clerkId || '',
        });
    }

    const questions = JSON.parse(JSON.stringify(result.questions));

    return (
        <>
            <div>
                <ImageSwiper />
            </div>

            <div className="min-[320px]:mt-0 sm:mt-0 md:mt-0 lg:mt-5 xl:mt-5 2xl:mt-0 flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="h1-bold text-dark100_light900">All Problems</h1>

				<div className="flex gap-2">
					<InstantCall
						skills={skills} 
						mongoUserId={JSON.stringify(mongoUserId)}
					/>

					<Link
						href="/post-problem"
						className="flex justify-end max-sm:w-full"
					>
						<Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
							Post a Problem
						</Button>
					</Link>
				</div>
            </div>

            <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
                <LocalSearchbar
                    route="/home"
                    iconPosition="left"
                    imgSrc="/assets/icons/search.svg"
                    placeholder="Search for problems"
                    otherClasses="flex-1"
                />

                <Filter
                    filters={HomePageFilters}
                    otherClasses="min-h-[56px] sm:min-w-[170px]"
                    containerClasses=" max-md:flex"
                />
            </div>

            <HomeFilters filters={HomePageFilters} />
            <QuestionsContainer
                questions={questions}
                clerkId={clerkId}
                mongoUserId={mongoUserId}
            />

            <div className="mt-10">
                <Pagination
                    pageNumber={searchParams?.page ? +searchParams.page : 1}
                    isNext={result.isNext}
                />
            </div>
        </>
    );
}
