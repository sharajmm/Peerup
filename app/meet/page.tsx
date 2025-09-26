"use client";
import { useEffect, useRef } from "react";

export default function MeetPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep a ref to the external API instance so we can dispose it on unmount.
  const apiRef = useRef<any>(null);

  useEffect(() => {
    const scriptId = "jaas-external-api";
    const scriptSrc =
      "https://8x8.vc/vpaas-magic-cookie-d9068a16d1544001b37b9a92fa789d0e/external_api.js";
    let createdScript = false;

    const createApi = () => {
      if (!containerRef.current) return;
      // If API already exists we shouldn't create a second instance
      if ((window as any).JitsiMeetExternalAPI && !apiRef.current) {
        // @ts-ignore
        apiRef.current = new (window as any).JitsiMeetExternalAPI("8x8.vc", {
          roomName:
            "vpaas-magic-cookie-d9068a16d1544001b37b9a92fa789d0e/SampleAppFierceSpellsRelieveOften",
          parentNode: containerRef.current,
        });
      }
    };

    let scriptEl = document.getElementById(
      scriptId
    ) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = scriptId;
      scriptEl.src = scriptSrc;
      scriptEl.async = true;
      scriptEl.onload = () => createApi();
      document.body.appendChild(scriptEl);
      createdScript = true;
    } else {
      // Script already present on the page — either use the existing API or wait for it to load
      if ((window as any).JitsiMeetExternalAPI) {
        createApi();
      } else {
        // In case the script exists but hasn't loaded yet
        const onLoad = () => {
          createApi();
          scriptEl?.removeEventListener("load", onLoad);
        };
        scriptEl.addEventListener("load", onLoad);
      }
    }

    return () => {
      // Dispose the embedded meeting if possible
      if (apiRef.current && typeof apiRef.current.dispose === "function") {
        try {
          apiRef.current.dispose();
        } catch (e) {
          // ignore dispose errors
        }
        apiRef.current = null;
      }

      // Clear any leftover DOM inside the container
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      // If we added the script during this mount, remove it. If it existed before, leave it.
      if (createdScript && scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%" }} id="jaas-container" />
    </div>
  );
}
