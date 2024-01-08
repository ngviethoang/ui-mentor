import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { css as langCss } from '@codemirror/lang-css';
import { html as langHtml } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import ReactCodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useState } from 'react';
import Settings, { SettingsDataProps } from './code-editor-settings';
import { TutorialStepProps } from '@/app/page';
import Markdown from 'react-markdown';
import { ScrollArea } from '../ui/scroll-area';
import { CodeEditorSourceCodeDialog } from './code-editor-source-code';

interface CodeEditorProps {
  tutorialSteps: TutorialStepProps[];
  currentTutorialStep: number;
  loading: boolean;
  onPrevStep?: () => void;
  onNextStep?: () => void;
  onBack?: () => void;
}

export default function CodeEditor({
  tutorialSteps,
  currentTutorialStep,
  loading,
  onPrevStep,
  onNextStep,
  onBack,
}: CodeEditorProps) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [srcDoc, setSrcDoc] = useState('');
  const [settings, setSettings] = useState<SettingsDataProps>({
    html: {
      className: '',
      bodyClassName: '',
      headTags: '',
    },
    css: {
      externalLinks: [''],
    },
    js: {
      externalLinks: [''],
    },
  });
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
      <html class="${settings.html.className}">
        <head>
          ${settings.html.headTags}
          ${settings.css.externalLinks
            .filter((link) => link)
            .map((link) => `<link rel="stylesheet" href="${link}" />`)
            .join('')}
          <style>${css}</style>
        </head>
        <body class="${settings.html.bodyClassName}">
          ${html}
          ${settings.js.externalLinks
            .filter((link) => link)
            .map((link) => `<script crossorigin src="${link}"></script>`)
            .join('')}
          <script>${js}</script>
        </body>
      </html>
    `);
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <div className="w-full h-full">
      <ResizablePanelGroup direction={layout}>
        <ResizablePanel>
          <div className="h-full pb-2 px-2 border-r-2">
            <div className="flex justify-between items-center py-2">
              <div className="flex gap-2">
                <Button onClick={onBack} size="sm" variant="secondary">
                  Back
                </Button>
                <Settings
                  data={settings}
                  onChange={(val) => {
                    setSettings(val);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onPrevStep}
                  disabled={currentTutorialStep === 0}
                >
                  Previous Step
                </Button>
                <Button size="sm" onClick={onNextStep} disabled={loading}>
                  Next Step
                </Button>
              </div>
            </div>
            <div className="px-4 mt-4">
              {tutorialSteps.length > 0 && (
                <Markdown
                  // eslint-disable-next-line react/no-children-prop
                  children={tutorialSteps[currentTutorialStep].content}
                  components={{
                    pre: ({ node, children, ...props }) => {
                      return (
                        <pre {...props} className="overflow-x-auto my-4">
                          <div className="flex justify-end">
                            <Button
                              size={'sm'}
                              variant={'secondary'}
                              onClick={() => {
                                try {
                                  navigator.clipboard.writeText(
                                    (node?.children[0] as any).children[0].value
                                  );
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                          {children}
                        </pre>
                      );
                    },
                  }}
                />
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel>
          <ResizablePanelGroup
            direction={layout === 'horizontal' ? 'vertical' : 'horizontal'}
          >
            <ResizablePanel>
              <div className="h-full pb-2 px-2">
                <div>HTML</div>
                <ReactCodeMirror
                  className="h-full"
                  height="100%"
                  value={html}
                  onChange={(val) => setHtml(val)}
                  extensions={[langHtml({})]}
                  theme={themeMode}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <div className="h-full pb-2 px-2">
                <div>CSS</div>
                <ReactCodeMirror
                  className="h-full"
                  height="100%"
                  value={css}
                  onChange={(val) => setCss(val)}
                  extensions={[langCss()]}
                  theme={themeMode}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <div
                className={`h-full pb-2 ${
                  layout === 'horizontal' ? 'px-2' : ''
                }`}
              >
                <div>JS</div>
                <ReactCodeMirror
                  className="h-full"
                  height="100%"
                  value={js}
                  onChange={(val) => setJs(val)}
                  extensions={[javascript()]}
                  theme={themeMode}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel>
          <div className="flex justify-between items-center">
            <div>Preview</div>
            <div>
              <CodeEditorSourceCodeDialog srcDoc={srcDoc} />
            </div>
          </div>
          <div className="bg-white w-full h-full">
            <iframe title="result" srcDoc={srcDoc} className="w-full h-full" />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
