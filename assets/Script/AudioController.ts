import { _decorator, Component, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass("AudioController")
export class AudioController extends Component {
    // 实例
    private static _instance: AudioController = null

    @property(AudioSource)
    public _audioSource: AudioSource = null;

    @property(AudioClip)
    private create: AudioClip = null;

    @property(AudioClip)
    private score: AudioClip = null;

    onLoad () {
        this.initInstance()
        this._audioSource = this.node.getComponent(AudioSource);
    }

    // 初始化实例
    private initInstance() {
        AudioController._instance = this
    }
    public static get Instance() {
        return this._instance
    }

    public playCreate () {
        this._audioSource.playOneShot(this.create, 0.1)
    }

    public playScore () {
        this._audioSource.playOneShot(this.score, 1)
    }
}