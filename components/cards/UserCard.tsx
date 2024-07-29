import Link from "next/link";
import Image from "next/image";

import { getTopInteractedSkill } from "@/lib/actions/skill.action";

import { Badge } from "@/components/ui/badge";
import RenderTag from "@/components/shared/RenderTag";
import SkillBadge from "@/components/shared/SkillBadge";

interface Props {
    user: {
        _id: string;
        clerkId: string;
        picture: string;
        name: string;
        username: string;
    },
    className?: string;
}

const UserCard = async ({ user, className = '' }: Props) => {
    const interactedTags = await getTopInteractedSkill({
        userId: user._id,
    });

    return (
        <Link
            href={`/profile/${user.clerkId}`}
            className={`shadow-light100_darknone w-full max-xs:min-w-full xs:w-[260px] ${className}`}
        >
            <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8">
                <Image
                    src={user.picture}
                    alt="User profile picture"
                    width={100}
                    height={100}
                    className="rounded-full"
                />
                <div className="mt-4 text-center">
                    <h3 className="h3-bold text-dark200_light900 line-clamp-1">
                        {user.name}
                    </h3>
                    <p className="body-regular text-dark500_light500 mt-2">
                        @{user.username}
                    </p>
                </div>

                <div className="mt-5 min-h-[56px]">
                  {interactedTags.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {interactedTags.slice(0, 3).map((tag: any) => (
                        <RenderTag key={tag._id} _id={tag._id} name={tag.name} size="small" />
                      ))}
                      {interactedTags.length > 3 && (
                        <SkillBadge size='small' text={`+${interactedTags.length - 3} Skills`} />
                      )}
                    </div>
                  ) : (
                    <Badge className="text-dark500_light700">No Skills yet</Badge>
                  )}
                </div>
            </article>
        </Link>
    );
};

export default UserCard;
