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

export function OpenaiDialog() {
  const { openaiKey, setOpenaiKey } = useBearStore((state) => state);

  const [key, setKey] = useState<string>('');

  useEffect(() => {
    setKey(openaiKey || '');
  }, [openaiKey]);

  const submit = () => {
    setOpenaiKey(key);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          {!!openaiKey ? 'Edit' : 'Add'} OpenAI API key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>OpenAI Config</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="key" className="text-right">
              API Key
            </Label>
            <Input
              id="key"
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" onClick={submit}>
              Save changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
