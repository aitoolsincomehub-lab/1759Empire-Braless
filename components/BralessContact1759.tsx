"use client";

import { useEffect, useRef, useState } from "react";
import GeneralEnquiryForm from "@/components/GeneralEnquiryForm";
import styles from "@/components/BralessCampaign.module.css";

type BralessContact1759Props = {
  whatsapp: string;
  children: React.ReactNode;
  showFloating?: boolean;
  ownsModal?: boolean;
  gold?: boolean;
  className?: string;
};

export default function BralessContact1759({
  whatsapp,
  children,
  showFloating = false,
  ownsModal = false,
  gold = false,
  className = "",
}: BralessContact1759Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function closeModal() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function openModal() {
    if (ownsModal) {
      setOpen(true);
      return;
    }

    window.dispatchEvent(new CustomEvent("braless-contact-open"));
  }

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    window.addEventListener("braless-contact-open", handleOpen);
    if (!ownsModal || !open) {
      return () => window.removeEventListener("braless-contact-open", handleOpen);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("braless-contact-open", handleOpen);
    };
  }, [open, ownsModal]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.contactTrigger} ${gold ? styles.goldContactTrigger : ""} ${className}`}
        onClick={openModal}
      >
        {children}
      </button>

      {showFloating && (
        <button
          type="button"
          className={styles.contactFloating}
          onClick={openModal}
        >
          CONTACT 1759
        </button>
      )}

      {ownsModal && open && (
        <div
          className={styles.contactBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className={styles.contactModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-1759-title"
            aria-describedby="contact-1759-description"
          >
            <button
              ref={closeRef}
              type="button"
              className={styles.contactClose}
              aria-label="Close Contact 1759 dialog"
              onClick={closeModal}
            >
              <span aria-hidden="true">&#10005;</span>
            </button>

            <p className={styles.eyebrow}>1759 EMPIRE</p>
            <h2 id="contact-1759-title">Contact 1759</h2>
            <p id="contact-1759-description" className={styles.contactIntro}>
              Tell us what you&apos;re looking for and our team will help you
              with your Braless experience.
            </p>

            <GeneralEnquiryForm whatsapp={whatsapp} />
          </div>
        </div>
      )}
    </>
  );
}
