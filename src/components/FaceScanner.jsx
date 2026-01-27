import useFaceID from '../hooks/useFaceID';

const FaceScanner = ({ onScanSuccess, onScanFailure }) => {
    const { status, startScan, simulateSuccess, simulateFailure } = useFaceID(onScanSuccess, onScanFailure);

    // useEffect for camera logic can be moved to the hook or kept here if it interacts with DOM elements directly, 
    // but for now the hook handles the simulation logic.
    // If there was real camera logic it might be better inside the component or a dedicated hook effect.
    // For this refactor, we are using the hook's returned state and functions.

    return (
        <div id="face-container">
            {status === 'idle' && (
                <div style={{ textAlign: 'center', color: '#6c757d', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '3rem' }}>👤</div>
                    <p>Camera Off</p>
                    <button className="btn btn-primary" onClick={startScan}>Start Camera</button>
                </div>
            )}

            {status === 'scanning' && (
                <div className="face-scanner">
                    <div className="face-overlay" style={{
                        width: '200px', height: '200px', border: '2px solid #fff', margin: '0 auto',
                        position: 'relative', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#000'
                    }}>
                        <div className="scan-line" style={{
                            width: '100%', height: '2px', backgroundColor: '#0f0',
                            position: 'absolute', top: '0', animation: 'scan 2s linear infinite'
                        }}></div>
                        <style>{`
                            @keyframes scan {
                                0% { top: 0; }
                                100% { top: 100%; }
                            }
                        `}</style>
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--primary-color)', fontFamily: 'monospace' }}>ANALYZING BIOMETRICS...</p>
                </div>
            )}

            {status === 'success' && (
                <div style={{ textAlign: 'center', color: 'var(--success-color)' }}>
                    <div style={{ fontSize: '4rem' }}>😊</div>
                    <h3>Match Found</h3>
                    <p>Confidence: 98.4%</p>
                </div>
            )}

            {status === 'failure' && (
                <div style={{ textAlign: 'center', color: '#dc3545' }}>
                    <div style={{ fontSize: '4rem' }}>⚠️</div>
                    <h3>No Match</h3>
                    <p>Try Again</p>
                </div>
            )}

            {status === 'scanning' && (
                <div className="mock-actions" style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button className="btn btn-secondary" onClick={simulateSuccess} style={{ marginRight: '0.5rem' }}>Debug: Simulate Face Match</button>
                    <button className="btn btn-secondary" onClick={simulateFailure} style={{ backgroundColor: '#dc3545' }}>Debug: Simulate Fail</button>
                </div>
            )}
        </div>
    );
};

export default FaceScanner;
