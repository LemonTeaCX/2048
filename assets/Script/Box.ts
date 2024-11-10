import {
    _decorator, Component,
    Color,
    UITransform, Sprite, Label
} from 'cc'
const { ccclass, property } = _decorator

import { Manager } from 'db://assets/Script/Manager'
import type { BoxType, BoxAttr, } from 'db://assets/Script/Type'

const BOX_TYPE: BoxType = {
    0: new Color('#c8beb3'),
    2: new Color('#ece5db'),
    4: new Color('c8beb3'),
}

@ccclass('Box')
export class Box extends Component {
    onLoad() {
        // Manager.Instance.getBoxInstance(this)
        // this.init()

        Manager.Instance.eventTarget.emit('boxInstantiate', this)
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    private init() {
        this.initEvent()
    }

    private initEvent() {
        Manager.Instance.eventTarget.once('boxInstantiate', (attr: BoxAttr) => {
            this.setAttr(attr)
        })
    }

    public setAttr({ type, size, position }: BoxAttr) {
        const node = this.node

        node.setPosition(position)
        node.getComponent(UITransform).setContentSize(size)
        node.getComponent(Sprite).color = BOX_TYPE[type]

        if (type !== 0) {
            node.getChildByName('Value').getComponent(Label).string = type+''
        }
    }

    private moveBox() {
        // this.node
    }
}

