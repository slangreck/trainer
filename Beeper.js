class Beeper {
    static audioContext;

    static beep(duration = 200, frequency = 440, volume = 100) {
        if (!Beeper.audioContext) {
            Beeper.audioContext = new AudioContext();
        }

        return new Promise((resolve, reject) => {    
            try{
                const oscillatorNode = Beeper.audioContext.createOscillator();
                const gainNode = Beeper.audioContext.createGain();
                oscillatorNode.connect(gainNode);
    
                // Set the oscillator frequency in hertz
                oscillatorNode.frequency.value = frequency;
    
                // Set the type of oscillator
                oscillatorNode.type= "square";
                gainNode.connect(Beeper.audioContext.destination);
    
                // Set the gain to the volume
                gainNode.gain.value = volume * 0.01;
    
                // Start audio with the desired duration
                oscillatorNode.start(Beeper.audioContext.currentTime);
                oscillatorNode.stop(Beeper.audioContext.currentTime + duration * 0.001);
    
                // Resolve the promise when the sound is finished
                oscillatorNode.onended = () => {
                    resolve();
                };
            }catch(error){
                reject(error);
            }
        });
    }
}