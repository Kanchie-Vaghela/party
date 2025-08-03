class PeerService{
    constructor(){
        if(!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers:[{
                    urls: [
                        "stun:stun.l.google.com:19302",
                        'stun:global.stun.twilio.com:3478',
                    ]
                }]
            })
        }
    }

    async getOffer(){
        if(this.peer){
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return this.peer.localDescription;
        }
    }

    async getAnswer(offer){
        if(this.peer){
            await this.peer.setRemoteDescription(offer)
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return this.peer.localDescription;
        }
    }

    async setLocalDescription(answer){
        if(this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }
}

export default new PeerService();