import { describe, it, expect } from "vitest";
import { transcriptToMessages } from "../src/lib/transcript";

describe("transcriptToMessages", () => {
  it("parses a simple 2-turn conversation", () => {
    const transcript = `[Call connected to Sushi Saito]

Agent: お忙しいところ恐れ入ります。お客様の代理でお電話しております。金曜日の19時に2名で予約をお願いしたいのですが。

Business: はい、金曜日の19時ですね。お名前をお願いします。

Agent: 田中と申します。よろしくお願いいたします。
`;

    const messages = transcriptToMessages(transcript);

    expect(messages).toHaveLength(3);
    expect(messages[0]).toEqual({
      role: "assistant",
      content: "お忙しいところ恐れ入ります。お客様の代理でお電話しております。金曜日の19時に2名で予約をお願いしたいのですが。",
    });
    expect(messages[1]).toEqual({
      role: "user",
      content: "はい、金曜日の19時ですね。お名前をお願いします。",
    });
    expect(messages[2]).toEqual({
      role: "assistant",
      content: "田中と申します。よろしくお願いいたします。",
    });
  });

  it("skips metadata lines like [Call connected...]", () => {
    const transcript = `[Call connected to Test Business]

Agent: Hello, I'm calling on behalf of a client.

[Some metadata]

Business: Yes, how can I help?

[Call ended — objective achieved]`;

    const messages = transcriptToMessages(transcript);

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("assistant");
    expect(messages[1].role).toBe("user");
  });

  it("handles empty transcript", () => {
    expect(transcriptToMessages("")).toEqual([]);
  });

  it("handles transcript with only metadata", () => {
    const transcript = `[Call connected to Business]
[Call ended — no conversation]`;

    expect(transcriptToMessages(transcript)).toEqual([]);
  });

  it("handles multi-line speaker content", () => {
    const transcript = `Agent: Hello, I'm calling on behalf of a client.
I'd like to make a reservation please.

Business: Sure, for how many people?`;

    const messages = transcriptToMessages(transcript);

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toBe(
      "Hello, I'm calling on behalf of a client. I'd like to make a reservation please."
    );
    expect(messages[1].content).toBe("Sure, for how many people?");
  });

  it("preserves correct role alternation for long conversations", () => {
    const transcript = `Agent: Greeting
Business: Response 1
Agent: Reply 1
Business: Response 2
Agent: Reply 2
Business: Response 3
Agent: Reply 3
Business: Response 4
Agent: Reply 4`;

    const messages = transcriptToMessages(transcript);

    expect(messages).toHaveLength(9);
    expect(messages.map((m) => m.role)).toEqual([
      "assistant", "user", "assistant", "user", "assistant",
      "user", "assistant", "user", "assistant",
    ]);
  });

  it("handles transcript with only agent speech (no business response yet)", () => {
    const transcript = `[Call connected to Business]

Agent: Hello, I'm calling on behalf of a client.
`;

    const messages = transcriptToMessages(transcript);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual({
      role: "assistant",
      content: "Hello, I'm calling on behalf of a client.",
    });
  });

  it("handles DTMF digits appearing as business speech", () => {
    const transcript = `Agent: Please press 1 for reservations.

Business: 1

Agent: Thank you. How can I help?`;

    const messages = transcriptToMessages(transcript);

    expect(messages).toHaveLength(3);
    expect(messages[1].content).toBe("1");
  });
});
