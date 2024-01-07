'use client';

import CodeEditor from '@/components/common/code-editor';
import { OpenaiDialog } from '@/components/common/openai-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import openai from '@/lib/openai';
import { systemPrompt } from '@/lib/prompt';
import { toBase64 } from '@/lib/utils';
import { useBearStore } from '@/store';
import Image from 'next/image';
import { useState } from 'react';
import { Dropzone, ExtFile, FileMosaic } from '@dropzone-ui/react';
import Loader from '@/components/common/loader';
import { TypewriterEffect } from '@/components/ui/typewriter-effect';
export interface TutorialStepProps {
  step: number;
  content: string;
}

export default function Home() {
  const { openaiKey, setOpenaiKey } = useBearStore((state) => state);

  const [uploadedImages, setUploadedImages] = useState<ExtFile[]>([]);
  const [imageDescription, setImageDescription] = useState<string>('');
  const [loadingApi, setLoadingApi] = useState<boolean>(false);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStepProps[]>([]);
  const [currentTutorialStep, setCurrentTutorialStep] = useState<number>(0);
  const [openaiMessages, setOpenaiMessages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const submit = async () => {
    if (!openaiKey) {
      return;
    }
    setLoadingApi(true);
    setCurrentPage(2);

    const uploadedImageBase64s = [];
    for (const uploadedImage of uploadedImages) {
      uploadedImageBase64s.push(await toBase64(uploadedImage.file));
    }

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Here is the description of the image: ${
              imageDescription || 'none'
            }. Help me build this website.`,
          },
          ...uploadedImageBase64s
            .map((uploadedImageBase64) =>
              uploadedImageBase64
                ? {
                    type: 'image_url',
                    image_url: {
                      url: uploadedImageBase64,
                    },
                  }
                : null
            )
            .filter((i) => !!i),
        ],
      },
    ];

    const response = await openai.createChatCompletions(openaiKey, {
      model: 'gpt-4-vision-preview',
      messages: messages,
      max_tokens: 350,
    });

    setTutorialSteps((prev) => {
      return [
        ...prev,
        {
          step: prev.length + 1,
          content: response.choices[0].message.content,
        },
      ];
    });
    setOpenaiMessages([...messages, response.choices[0].message]);
    setLoadingApi(false);
  };

  const onNextTutorialStep = async () => {
    if (!openaiKey) {
      return;
    }
    setLoadingApi(true);

    const response = await openai.createChatCompletions(openaiKey, {
      model: 'gpt-4-vision-preview',
      messages: [
        ...openaiMessages,
        {
          role: 'user',
          content: 'continue',
        },
      ],
      max_tokens: 350,
    });

    setTutorialSteps((prev) => {
      return [
        ...prev,
        {
          step: prev.length + 1,
          content: response.choices[0].message.content,
        },
      ];
    });
    setOpenaiMessages([...openaiMessages, response.choices[0].message]);
    setLoadingApi(false);
    setCurrentTutorialStep((prev) => prev + 1);
  };

  return (
    <main className="w-screen h-screen">
      {currentPage === 1 && (
        <>
          <div className="my-8 bx-3">
            <div className="text-5xl text-center font-bold">UI Mentor</div>
            <div className="text-xl text-center ">
              Learn how to build website with step-by-step tutorial
            </div>
          </div>
          <div className="m-auto max-w-[550px] text-center">
            <Label>
              Upload your website images and describe your website, we will help
              you build it (you need to bring your own OpenAI API key with{' '}
              <a
                href="https://platform.openai.com/docs/guides/vision"
                target="_blank"
                className="text-blue-500"
              >
                GPT-4V{' '}
              </a>
              access)
            </Label>
            <Dropzone
              className="mt-2"
              onChange={(e) => {
                setUploadedImages(e);
              }}
              value={uploadedImages}
              accept="image/*"
              label="Drag & drop your website images here or click to browse"
            >
              {uploadedImages.map((file, i) => (
                <FileMosaic key={i} {...file} preview />
              ))}
            </Dropzone>
            <div className="mt-5">
              <Label>Website description</Label>
              <Textarea
                value={imageDescription}
                onChange={(e) => {
                  setImageDescription(e.target.value);
                }}
              />
            </div>
            <div className="my-3">
              <OpenaiDialog />
            </div>
            <Button
              onClick={submit}
              className="px-12 text-white"
              disabled={
                !openaiKey || (!uploadedImages.length && !imageDescription)
              }
            >
              Submit
            </Button>
          </div>
        </>
      )}
      {currentPage === 2 && (
        <div className="w-full h-full relative">
          {loadingApi && (
            <div
              className="w-full h-full flex justify-center items-center absolute top-0 left-0 z-10"
              style={{ background: 'rgba(0,0,0,.8)' }}
            >
              <Loader />
            </div>
          )}
          <CodeEditor
            tutorialSteps={tutorialSteps}
            currentTutorialStep={currentTutorialStep}
            loading={loadingApi}
            onPrevStep={() => {
              if (currentTutorialStep > 0) {
                setCurrentTutorialStep(currentTutorialStep - 1);
              }
            }}
            onNextStep={() => {
              if (currentTutorialStep < tutorialSteps.length - 1) {
                setCurrentTutorialStep(currentTutorialStep + 1);
              } else {
                onNextTutorialStep();
              }
            }}
            onBack={() => {
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </main>
  );
}
