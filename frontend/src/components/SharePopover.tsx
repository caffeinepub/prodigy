import React, { useState } from 'react';
import { Share2, Twitter, Link2, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SharePopoverProps {
  bookId: bigint | number;
  bookTitle: string;
  trigger?: React.ReactNode;
}

export default function SharePopover({ bookId, bookTitle, trigger }: SharePopoverProps) {
  const [copied, setCopied] = useState(false);

  const bookUrl = `${window.location.origin}/book/${bookId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleTwitterShare = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(bookUrl)}&text=${encodeURIComponent(`Check out "${bookTitle}" on Prodigy Library!`)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 size={14} />
            Share
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3" align="end">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Share this book</p>
        <div className="space-y-1.5">
          <button
            onClick={handleTwitterShare}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
          >
            <Twitter size={15} className="text-[#1DA1F2]" />
            Share on X / Twitter
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
          >
            {copied ? (
              <Check size={15} className="text-green-500" />
            ) : (
              <Link2 size={15} className="text-primary" />
            )}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
