import { FC } from "react";
import {
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";

import CustomChannelHeader from "./CustomChannelHeader";

interface ChatChannelProps {
  show: boolean;
  hideChannelOnThread: boolean;
  activeChannel: StreamChannel | undefined;
}

const MessageChannel: FC<ChatChannelProps> = ({
  show,
  hideChannelOnThread,
  activeChannel,
}) => {
  return (
    <div className={`size-full ${show ? "block" : "hidden"}`}>
      <Channel channel={activeChannel}>
        <Window hideOnThread={hideChannelOnThread}>
          <CustomChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </div>
  );
};

export default MessageChannel;
