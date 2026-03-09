import { useState, useCallback } from 'react';

const useFaceID = (onScanSuccess, onScanFailure) => {
    const [status, setStatus] = useState('idle'); // idle, scanning, success, failure

    const startScan = useCallback(() => {
        setStatus('scanning');
    }, []);

    const simulateSuccess = useCallback(() => {
        if (status === 'scanning') {
            setStatus('success');
            setTimeout(() => {
                if (onScanSuccess) onScanSuccess();
            }, 1000); // Wait a bit to show success message
        }
    }, [status, onScanSuccess]);

    const simulateFailure = useCallback(() => {
        if (status === 'scanning') {
            setStatus('failure');
            // Allow retry
            setTimeout(() => {
                if (onScanFailure) onScanFailure(new Error("Face not recognized"));
                setStatus('idle');
            }, 1000);
        }
    }, [status, onScanFailure]);

    return {
        status,
        startScan,
        simulateSuccess,
        simulateFailure
    };
};

export default useFaceID;
