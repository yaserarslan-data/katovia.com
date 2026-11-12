/* File-based Foley with independent ambience/effects gains. Music hook is optional. */
(function(root){
  'use strict';
  const FILES=['stamp','stamp-lift','paper-pick','paper-slide','paper-return','book-open','queue-bell','citation-printer','drawer','shift-clear'];
  class OfficeAudio {
    constructor({enabled=false,effects=.8,ambience=.35,onUnavailable=()=>{}}={}){
      this.enabled=enabled;this.effects=effects;this.ambience=ambience;this.onUnavailable=onUnavailable;
      this.suspended=false;this.available=true;this.lastPlayed={};this.history=[];this.voices=new Set();
      this.bank=Object.fromEntries(FILES.map(name=>{const a=new Audio('assets/audio/'+name+'.wav');a.preload='auto';return [name,a];}));
      this.room=new Audio('assets/audio/office-tone.wav');this.room.preload='auto';this.room.loop=true;
      // No ACE-Step track is supplied in this revision: generation was deferred by the owner.
      this.music=null;
    }
    settings(enabled,effects=this.effects,ambience=this.ambience){
      this.enabled=!!enabled;this.effects=Math.max(0,Math.min(1,effects));this.ambience=Math.max(0,Math.min(1,ambience));
      this.room.volume=this.ambience*.65;this.voices.forEach(v=>v.volume=this.effects*.8);
      if(!this.enabled){this.voices.forEach(v=>v.pause());this.voices.clear();}
      this.updateRoom();
    }
    updateRoom(){
      this.room.volume=this.ambience*.65;
      if(this.enabled&&!this.suspended&&this.ambience>0)this.room.play().catch(()=>{});else this.room.pause();
    }
    suspend(value){this.suspended=!!value;if(value){this.voices.forEach(v=>v.pause());this.voices.clear();}this.updateRoom();}
    play(name,{volume=1,throttle=0}={}){
      if(!this.enabled||this.suspended||this.effects===0||!this.bank[name])return;
      const t=performance.now();if(throttle&&t-(this.lastPlayed[name]||-Infinity)<throttle)return;this.lastPlayed[name]=t;
      const voice=this.bank[name].cloneNode();voice.volume=Math.max(0,Math.min(1,this.effects*volume));
      this.history.push(name);this.history=this.history.slice(-60);this.voices.add(voice);
      voice.onended=()=>this.voices.delete(voice);
      voice.onerror=()=>{this.voices.delete(voice);this.available=false;this.onUnavailable();};
      if(this.voices.size>8){const oldest=this.voices.values().next().value;oldest.pause();this.voices.delete(oldest);}
      voice.play().catch(()=>this.voices.delete(voice));
    }
    status(){return {enabled:this.enabled,suspended:this.suspended,available:this.available,effects:this.effects,ambience:this.ambience,playing:[...this.voices].filter(v=>!v.paused).length,history:[...this.history],roomPlaying:!this.room.paused,roomReady:this.room.readyState,musicLoaded:!!this.music};}
  }
  root.OfficeAudio=OfficeAudio;
})(window);
