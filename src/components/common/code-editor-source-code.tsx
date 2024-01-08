import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBearStore } from '@/store';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

interface CodeEditorSourceCodeDialogProps {
  srcDoc: string;
}

export function CodeEditorSourceCodeDialog({
  srcDoc,
}: CodeEditorSourceCodeDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">Source code</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <Markdown
          // eslint-disable-next-line react/no-children-prop
          children={srcDoc}
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
      </DialogContent>
    </Dialog>
  );
}
