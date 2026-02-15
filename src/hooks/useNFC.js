import { useState, useRef, useEffect } from 'react';

export const useNFC = () => {
    const [isReading, setIsReading] = useState(false);
    const [error, setError] = useState(null);
    const abortController = useRef(null);

    const scan = async (onReading) => {
        if (!('NDEFReader' in window)) {
            setError("Web NFC is not supported on this device/browser.");
            return;
        }

        abortController.current = new AbortController();
        setError(null);
        setIsReading(true);

        try {
            const ndef = new NDEFReader();
            await ndef.scan({ signal: abortController.current.signal });

            ndef.onreading = event => {
                console.log("NFC Read Event:", event);
                console.log("NFC Serial Number:", event.serialNumber);

                const decoder = new TextDecoder();
                // Initialize with serialNumber (UID) of the tag
                let data = { serialNumber: event.serialNumber || "" };

                // Log if serialNumber is missing
                if (!event.serialNumber) {
                    console.warn("NFC Warning: Serial Number is empty or undefined");
                }

                for (const record of event.message.records) {
                    console.log("NFC Record:", record);
                    if (record.recordType === "text") {
                        const text = decoder.decode(record.data);
                        try {
                            // Try to parse as JSON if possible, else just return text
                            const json = JSON.parse(text);
                            data = { ...data, ...json };
                        } catch (e) {
                            data.text = text;
                        }
                    } else if (record.recordType === "json") {
                        // This is more standard for data transfer
                        const json = JSON.parse(decoder.decode(record.data));
                        data = { ...data, ...json };
                    }
                }

                console.log("Final NFC Data Payload:", data);
                onReading(data);
            };

            ndef.onreadingerror = () => {
                setError("Cannot read data from the NFC tag. Try another one?");
            };

        } catch (err) {
            setIsReading(false);
            setError(`Error: ${err.message}`);
        }
    };

    const stop = () => {
        if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
        }
        setIsReading(false);
    };

    // Auto-stop on unmount
    useEffect(() => {
        return () => stop();
    }, []);

    return { scan, stop, isReading, error };
};
