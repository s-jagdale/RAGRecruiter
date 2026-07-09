import { useEffect } from "react";

const SCRIPT_ID = "watson-assistant-chat-script";

/**
 * Mounts the IBM Watson Assistant web chat widget.
 * Renders nothing itself — the Watson script injects its own floating
 * chat bubble into the page once loaded.
 *
 * Safe to mount on more than one page: the script/global options are
 * only ever set up once per page load.
 */
export default function WatsonAssistantWidget() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return; // already loaded

    window.watsonAssistantChatOptions = {
      integrationID: "2d43b70f-7e92-484e-8e17-5c83e9690ff4",
      region: "https://integrations.us-south.assistant.watson.appdomain.cloud",
      serviceInstanceID: "3a883798-775d-4d42-957b-c1b599e58fd0",
      onLoad: async (instance) => {
        await instance.render();
      },
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://web-chat.global.assistant.watson.appdomain.cloud/versions/${
      window.watsonAssistantChatOptions.clientVersion || "latest"
    }/WatsonAssistantChatEntry.js`;
    document.head.appendChild(script);
  }, []);

  return null;
}