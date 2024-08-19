/* eslint-disable prefer-promise-reject-errors */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { Editor } from '@tinymce/tinymce-react';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// import { useTheme } from '@/context/ThemeProvider';
import { useTheme } from 'next-themes';

import { QuestionValidation } from '@/lib/validations';
import { editQuestion, createQuestion } from '@/lib/actions/question.action';

import CreatableSelect from 'react-select/creatable';
import { MultiValue } from 'react-select';
import 'react-quill/dist/quill.snow.css';
import ImageUploader from 'quill-image-uploader';
import { Quill } from 'react-quill';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
Quill.register('modules/imageUploader', ImageUploader);

interface Props {
    type: string;
    mongoUserId: string;
    questionDetails?: string;
    skills?: string;
}
interface Option {
    label: string;
    value: string;
}

const Question = ({ type, mongoUserId, questionDetails, skills }: Props) => {
    // const gcpUrl = process.env.NEXT_GCP_UPLOAD_URL;
    const { theme } = useTheme();
    const [editorTheme, setEditorTheme] = useState('');
    // const editorRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();
    const options = [
        {
            label: 'Solved',
            value: 'solved',
        },
        {
            label: 'Unsolved',
            value: 'unsolved',
        },
    ];

    // const parsedSkills = skills && JSON.parse(skills || '');

    const parsedQuestionDetails =
        questionDetails && JSON.parse(questionDetails || '');

    const checkMark = options.find(
        option => option.value === parsedQuestionDetails?.mark,
    );
    const [optionValue, setOptionValue] = useState<Option | undefined>(
        checkMark || options[1],
    );

    const existingSkill = parsedQuestionDetails?.skills.map((item: any) => {
        return {
            value: item.name,
            label: item.name,
        };
    });

    const [selectedSkillOption, setSelectedSkillOption] = useState<
        MultiValue<Option>
    >(existingSkill || []);

    const [skillValidation, setSkillValidation] = useState<string>('');

    // const skillOptions = parsedSkills?.map((item: any) => {
    //     return {
    //         value: item.name,
    //         label: item.name,
    //     };
    // });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [skillOptions, setSkillOptions] = useState<Option[]>([]);
    const itemsPerPage = 20; 
    const parsedSkills = skills && JSON.parse(skills || '');

    const loadSkills = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const newSkills = parsedSkills.slice(start, end).map((item: any) => {
            return {
                value: item.name,
                label: item.name,
            };
        });
        setSkillOptions(prevSkills => [...prevSkills, ...newSkills]);
    };

    useEffect(() => {
        loadSkills();
    }, [currentPage]);

    const handleScrollToBottom = () => {
        if ((currentPage * itemsPerPage) < parsedSkills.length) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const form = useForm<z.infer<typeof QuestionValidation>>({
        resolver: zodResolver(QuestionValidation),
        defaultValues: {
            title: parsedQuestionDetails?.title || '',
            explanation: parsedQuestionDetails?.content || '',
            // skills: groupedSkills || [],
            mark: parsedQuestionDetails?.mark || optionValue?.value,
        },
    });

    async function onSubmit(values: z.infer<typeof QuestionValidation>) {
        setIsSubmitting(true);
        try {
            if (type === 'Edit') {
                await editQuestion({
                    questionId: parsedQuestionDetails._id,
                    title: values.title,
                    content: values.explanation,
                    path: pathname,
                    mark: values.mark,
                });
                router.push(`/question/${parsedQuestionDetails._id}`);
                setIsSubmitting(false);

                toast({
                    title: `Problem ${
                        type === 'Edit' ? 'edited' : 'posted'
                    } successfully 🎉`,
                    variant: 'default',
                });
            } else {
                if (selectedSkillOption.length === 0) {
                    setSkillValidation('Add at least 1 skill');
                    setIsSubmitting(false);
                } else {
                    const skills = selectedSkillOption.map((item: Option) => {
                        return item.value;
                    });
                    await createQuestion({
                        title: values.title,
                        content: values.explanation,
                        skills,
                        author: JSON.parse(mongoUserId),
                        path: pathname,
                    });
                    // navigate to home page
                    router.push('/home');
                    // setIsSubmitting(false);

                    toast({
                        title: `Problem ${
                            type === 'Edit' ? 'edited' : 'posted'
                        } successfully 🎉`,
                        variant: 'default',
                    });
                }
            }
        } catch (error) {
            toast({
                title: `Error ${type === 'Edit' ? 'editing' : 'posting'} problem ⚠️`,
                variant: 'destructive',
            });

            console.error(error);
        }
    }

    const handleMarkChange = (event: any) => {
        setOptionValue(event.target.value);
        form.setValue('mark', event.target.value);
    };

    const quillModules = {
        toolbar: [
            [{ header: '1' }, { header: '2' }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['bold', 'italic', 'underline'],
            ['link', 'image', 'video'],
        ],
    };

    // Update the editor theme based on the current page theme
    useEffect(() => {
        if (theme === 'dark') {
            setEditorTheme('dark');
        } else {
            setEditorTheme('light');
        }
    }, [theme]);

    // const handleImageUpload = (
    //     blobInfo: any,
    //     progress: (percent: number) => void,
    //     // failure: (message: string) => void,
    // ): Promise<string> => {
    //     return new Promise((resolve, reject) => {
    //         const xhr = new XMLHttpRequest();
    //         xhr.open(
    //             'POST',
    //             gcpUrl,
    //             true,
    //         );

    //         const formData = new FormData();
    //         formData.append('file', blobInfo.blob(), blobInfo.filename());

    //         xhr.upload.onprogress = e => {
    //             if (progress && typeof progress === 'function') {
    //                 const percent = (e.loaded / e.total) * 100;
    //                 progress(percent);
    //             }
    //         };

    //         xhr.onload = () => {
    //             if (xhr.status === 403) {
    //                 reject(new Error('HTTP Error: ' + xhr.status));
    //                 return;
    //             }

    //             if (xhr.status < 200 || xhr.status >= 300) {
    //                 reject(new Error('HTTP Error: ' + xhr.status));
    //                 return;
    //             }

    //             const json = JSON.parse(xhr.responseText);

    //             if (!json || typeof json.data !== 'string') {
    //                 reject(new Error('Invalid JSON: ' + xhr.responseText));
    //                 return;
    //             }

    //             resolve(json.data);
    //         };

    //         xhr.onerror = () => {
    //             reject(new Error('Image upload failed'));
    //             // if (failure && typeof failure === 'function') {
    //             //     failure('Image upload failed');
    //             // }
    //         };

    //         xhr.send(formData);
    //     });
    // };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-10">
                {type === 'Edit' && (
                    <FormField
                        control={form.control}
                        name="mark"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-col">
                                <FormLabel className="paragraph-semibold text-dark400_light800">
                                    Mark
                                    <span className="text-primary-500">*</span>
                                </FormLabel>
                                <FormControl className="mt-3.5">
                                    <select
                                        className=" no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] rounded-md border px-2"
                                        id="dropdown"
                                        value={optionValue?.value}
                                        onChange={handleMarkChange}>
                                        {options.map((option, index) => (
                                            <option
                                                key={index}
                                                value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormControl>

                                <FormMessage className="text-red-500" />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="paragraph-semibold text-dark400_light800">
                                Problem Title
                                <span className="text-primary-500">*</span>
                            </FormLabel>
                            <FormControl className="mt-3.5">
                                <Input
                                    maxLength={600}
                                    className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="body-regular mt-2.5 text-light-500">
                                Be specific and imagine you&apos;re asking a
                                problem to another person.
                            </FormDescription>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="explanation"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col gap-3">
                            <FormLabel className="paragraph-semibold text-dark400_light800">
                                Detailed explanation of your problem (1500
                                characters)
                            </FormLabel>
                            <FormControl className="mt-3.5">
                                <div
                                    className={
                                        editorTheme === 'dark' ? 'dark' : ''
                                    }>
                                    <ReactQuill
                                        className={`h-80 border-0 rounded-lg dark:bg-gray-800 dark:text-white bg-white text-black`}
                                        value={field.value}
                                        theme="snow"
                                        onChange={field.onChange}
                                        modules={quillModules}
                                    />
                                </div>

                                {/* <Editor
                                    apiKey={
                                        process.env.NEXT_PUBLIC_TINY_MCE_API_KEY
                                    }
                                    onInit={(evt, editor) => {
                                        // @ts-ignore
                                        editorRef.current = editor;
                                    }}
                                    onBlur={field.onBlur}
                                    onEditorChange={content =>
                                        field.onChange(content)
                                    }
                                    initialValue={
                                        parsedQuestionDetails?.content || ''
                                    }
                                    init={{
                                        height: 350,
                                        menubar: false,
                                        plugins: [
                                            'advlist',
                                            'autolink',
                                            'lists',
                                            'link',
                                            'image',
                                            'charmap',
                                            'preview',
                                            'anchor',
                                            'searchreplace',
                                            'visualblocks',
                                            'codesample',
                                            'fullscreen',
                                            'insertdatetime',
                                            'media',
                                            'table',
                                            'wordcount',
                                        ],
                                        toolbar:
                                            'undo redo | ' +
                                            'codesample | bold italic forecolor | alignleft aligncenter | link image |' +
                                            'alignright alignjustify | bullist numlist outdent indent',
                                        content_style:
                                            'body { font-family:Inter; font-size:16px }',
                                        skin:
                                            mode === 'dark'
                                                ? 'oxide-dark'
                                                : 'oxide',
                                        content_css:
                                            mode === 'dark' ? 'dark' : 'light',
                                        images_upload_handler: handleImageUpload
                                    }}
                                /> */}
                            </FormControl>
                            <FormDescription className="body-regular mt-2.5 text-light-500">
                                <br />
                                <br />
                                <br />
                                Introduces the problem and expand on what you
                                put in the title.
                            </FormDescription>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />

                <FormItem className="flex w-full flex-col">
                    <FormLabel className="paragraph-semibold text-dark400_light800 mb-2">
                        Skills <span className="text-primary-500">*</span>
                    </FormLabel>
                    <FormControl className="mt-3">
                        <CreatableSelect<Option, true>
                            defaultValue={selectedSkillOption}
                            onChange={setSelectedSkillOption}
                            isMulti
                            placeholder={'Select skill'}
                            options={skillOptions}
                            onMenuScrollToBottom={handleScrollToBottom}
                            menuPlacement="top"
                        />
                    </FormControl>
                    <FormDescription className="body-regular mt-2.5 text-light-500">
                        Add skills to describe what your problem is about. You
                        need to press enter to add a skill.
                    </FormDescription>
                    <FormMessage className="text-red-500">
                        {skillValidation}
                    </FormMessage>
                </FormItem>

                <Button
                    type="submit"
                    className="primary-gradient w-fit !text-light-900"
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>{type === 'Edit' ? 'Editing...' : 'Posting...'}</>
                    ) : (
                        <>{type === 'Edit' ? 'Submit' : 'Post a Problem'}</>
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default Question;
