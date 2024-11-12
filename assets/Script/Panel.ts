import { _decorator, Component, CCString, Label } from 'cc';
import { Manager } from 'db://assets/Script/Manager'
const { ccclass, property } = _decorator;

@ccclass('Panel')
export class Panel extends Component {
    @property({ type: CCString, tooltip: '唯一名称标识' })
    public key: string = 'key'

    @property({ type: CCString, tooltip: '标题' })
    private title: string = 'title'

    // 分数面板
    private scoreLabel: Label = null

    @property({ type: CCString, tooltip: '按钮名称' })
    private  btnName: string = '按钮'

    protected onLoad(): void {
        this.init()
        Manager.Instance.eventTarget.emit('panelInstantiate', this)
    }

    private init() {
        this.initLabel()
    }

    private initLabel() {
        const Score = this.node.getChildByName('Score')
        const Title = Score.getChildByName('Title')
        const Value = Score.getChildByName('Value')
        const Button = this.node.getChildByName('Button')
        const BtnLabel = Button.getChildByName('Label')

        Title.getComponent(Label).string = this.title
        BtnLabel.getComponent(Label).string = this.btnName

        this.scoreLabel = Value.getComponent(Label)
    }

    public setScore(score: number) {
        this.scoreLabel.string = score+''
    }
}

