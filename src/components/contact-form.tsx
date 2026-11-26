"use client";

import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      setError("Please add a subject and a message.");
      return;
    }

    if (from.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from.trim())) {
      setError("That email address does not look right.");
      return;
    }

    setError(null);

    const body = [
      message.trim(),
      "",
      "—",
      name.trim() ? `From: ${name.trim()}` : "",
      from.trim() ? `Reply to: ${from.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const href = `mailto:${email}?subject=${encodeURIComponent(
      subject.trim(),
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    toast.success("Opening your email app with the message ready to send.");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Your email</Label>
          <Input
            id="contact-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="How can we help?"
          aria-required="true"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what happened, including the post link if it helps."
          rows={6}
          aria-required="true"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          This opens your email app with the message filled in.
        </p>
        <Button type="submit" className="shrink-0">
          <Send className="size-4" />
          Send message
        </Button>
      </div>

      <p className="flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
        <Mail className="size-3.5" />
        Prefer email? Write to{" "}
        <a
          className="font-medium text-foreground underline underline-offset-4"
          href={`mailto:${email}`}
        >
          {email}
        </a>
      </p>
    </form>
  );
}
