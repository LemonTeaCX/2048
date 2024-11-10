import { _decorator, Component, CCString, CCInteger, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Panel')
export class Panel extends Component {
    @property({ type: CCString, tooltip: '标题' })
    private title: string = 'title'

    @property({ type: CCInteger, tooltip: '分数' })
    private value: number = 0

    @property({ type: CCString, tooltip: '按钮名称' })
    private  btnName: string = '按钮'

    onLoad(): void {
        this.init()
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
        Value.getComponent(Label).string = this.value+''
        BtnLabel.getComponent(Label).string = this.btnName
    }
}

