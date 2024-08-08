import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

import Metric from '@/components/shared/Metric';
import ParseHTML from '@/components/shared/ParseHTML';
import RenderTag from '@/components/shared/RenderTag';
import AllAnswers from '@/components/shared/AllAnswers';
import Votes from '@/components/shared/Votes';
import EditDeleteAction from '@/components/shared/EditDeleteAction';
import CompletionBadge from '@/components/shared/CompletionBadge';
import Answer from '@/components/forms/Answer';

import { getUserById } from '@/lib/actions/user.action';
import { getQuestionById } from '@/lib/actions/question.action';

import { getFormattedNumber, getTimestamp } from '@/lib/utils';

import type { URLProps } from '@/types';
import type { Metadata } from 'next';
import { SignedIn } from '@clerk/nextjs';

export async function generateMetadata({
    params,
}: Omit<URLProps, 'searchParams'>): Promise<Metadata> {
    const question = await getQuestionById({ questionId: params.id });

    return {
        title: `"${question.title}" — TheSkillGuru`,
    };
}

const Page = async ({ params, searchParams }: URLProps) => {
    const { userId: clerkId } = auth();

    let mongoUser;

    if (clerkId) {
        mongoUser = await getUserById({ userId: clerkId });
    } else {
        return redirect('/sign-in');
    }

    if (!mongoUser?.onboarded) redirect('/onboarding');

    const result = await getQuestionById({ questionId: params.id });
    if (!result) return null;

    const authorClerkId = result.author ? result.author.clerkId : null;
    const showActionButtons =
        clerkId && authorClerkId && clerkId === result?.author.clerkId;
    const isAuthorName = result.author?.name
        ? result.author.name
        : 'Deleted user';
    const isAuthorPicture = result.author?.picture
        ? result.author.picture
        : 'https://res.cloudinary.com/dsbhnzicr/image/upload/v1722395958/skillguru/defaultpicture_vbnwwx.jpg';

    return (
        <>
            <div className="flex-start w-full flex-col">
                <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                    <Link
                        href={`/profile/${authorClerkId || ''}`}
                        className="flex items-center justify-start gap-1">
                        <div className="rounded-full size-[22px] overflow-hidden">
                            <Image
                                src={isAuthorPicture}
                                alt="profile"
                                className="rounded-full"
                                width={22}
                                height={22}
                            />
                        </div>
                        <p className="paragraph-semibold text-dark300_light700">
                            {isAuthorName}
                        </p>
                    </Link>
                    <div className="flex justify-end">
                        <Votes
                            type="Question"
                            itemId={JSON.stringify(result._id)}
                            userId={JSON.stringify(mongoUser._id)}
                            upvotes={result.upvotes.length}
                            hasupVoted={result.upvotes.includes(mongoUser._id)}
                            downvotes={result.downvotes.length}
                            hasdownVoted={result.downvotes.includes(
                                mongoUser._id,
                            )}
                            hasSaved={mongoUser?.saved.includes(result._id)}
                        />
                    </div>
                </div>
                <div className="mt-4 w-full">
                    <CompletionBadge mark={result.mark} />
                </div>
                <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
                    {result.title}
                </h2>
            </div>

            <div className="mb-8 mt-5 flex flex-wrap gap-4">
                <Metric
                    imgUrl="/assets/icons/clock.svg"
                    alt="clock icon"
                    value={`Posted ${getTimestamp(result.createdAt)}`}
                    title=""
                    textStyles="small-medium text-dark400_light800"
                />
                <Metric
                    imgUrl="/assets/icons/message.svg"
                    alt="Message"
                    value={getFormattedNumber(result.answers.length)}
                    title=" Solutions"
                    textStyles="small-medium text-dark400_light800"
                />
                <Metric
                    imgUrl="/assets/icons/eye.svg"
                    alt="Eye"
                    value={getFormattedNumber(result.views)}
                    title=" Views"
                    textStyles="small-medium text-dark400_light800"
                />
            </div>

            <ParseHTML data={result.content} />

            <div className="mt-8 flex flex-row items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {result.skills.map((skill: any) => (
                        <RenderTag
                            key={skill._id}
                            _id={skill._id}
                            name={skill.name}
                        />
                    ))}
                </div>

                <SignedIn>
                    {showActionButtons && (
                        <EditDeleteAction
                            type="Question"
                            itemId={JSON.stringify(result._id)}
                        />
                    )}
                </SignedIn>
            </div>

            <AllAnswers
                questionId={result._id}
                userId={mongoUser._id}
                totalAnswers={result.answers.length}
                filter={searchParams?.filter}
                page={searchParams?.page ? +searchParams.page : 1}
            />

            {result.mark === 'unsolved' && authorClerkId && (
                <Answer
                    type="Create"
                    question={result.content}
                    questionTitle={result.title}
                    questionId={JSON.stringify(result._id)}
                    authorId={JSON.stringify(mongoUser._id)}
                />
            )}
        </>
    );
};

export default Page;
