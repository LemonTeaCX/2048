import {
    _decorator, Component, Node, Vec3,
    Color,
    UITransform, Sprite, Label
} from 'cc'
const { ccclass } = _decorator

import { Manager } from 'db://assets/Script/Manager'
import type { BoxType, BoxAttr } from 'db://assets/Script/Type'

const BOX_TYPE: BoxType = {
    0: new Color('#c8beb3'),
    2: new Color('#EEE4DA'),
    4: new Color('#EDE0C8'),
    8: new Color('#F2B179'),
    16: new Color('#F59563'),
    32: new Color('#F67C5F'),
    64: new Color('#F65E3B'),
    128: new Color('#EDCF72'),
    256: new Color('#EDCC61'),
    512: new Color('#EDC850'),
    1024: new Color('#EDC53F'),
    2048: new Color('#EDC22E'),
}

@ccclass('Box')
export class Box extends Component {
    private valueLabel: Label | null = null
    private boxSprite: Sprite | null = null

    private moveInfo: {
        moveTime: number
        direction: string
        position: BoxAttr['position']
    } | null = null

    private moveTime: number = 0

    protected onLoad() {
        this.init()
        Manager.Instance.eventTarget.emit('boxInstantiate', this)
    }

    protected update(deltaTime: number) {
        this.updatePosition(deltaTime)
    }

    private init() {
        this.valueLabel = this.node.getChildByName('Value').getComponent(Label)
        this.boxSprite = this.node.getComponent(Sprite)
    }

    public setAttr({ type, size, position }: BoxAttr) {
        const node = this.node

        node.setPosition(position)
        node.getComponent(UITransform).setContentSize(size)
        this.boxSprite.color = BOX_TYPE[type]

        if (type !== 0) {
            this.valueLabel.string = type+''
        }
    }

    public move(direction: string, position: BoxAttr['position'], type?: string) {
        let getPosition = () => new Vec3()

        // switch(direction) {
        //     case 'right':
        //         moveX += deltaTime * 100
        //         getPosition = (x, y) => new Vec3(x)
        //         break
        //     case 'left':
        //         moveX -= deltaTime * 100
        //         break
        //     case 'up':
        //         moveY += deltaTime * 100
        //         break
        //     case 'down':
        //         moveY -= deltaTime * 100
        //         break
        // }

        this.moveInfo = {
            moveTime: 0,
            direction,
            position,
        }
        // this.node.setPosition(position)

        if (type) {
            this.valueLabel.string = type
            this.boxSprite.color = BOX_TYPE[type]
        }
    }

    private updatePosition(deltaTime: number) {
        if (!this.moveInfo) return

        const { moveTime, direction, position } = this.moveInfo

        if (moveTime >= 1) {
            // 结束
            this.node.setPosition(position)
            this.moveInfo = null
        } else {
            // 移动中
            this.moveInfo.moveTime += deltaTime

            const curPosition = this.node.getPosition()
            const movePosition = new Vec3()

            let moveX = curPosition.x
            let moveY = curPosition.y
            switch(direction) {
                case 'right':
                    moveX += deltaTime * 100
                    break
                case 'left':
                    moveX -= deltaTime * 100
                    break
                case 'up':
                    moveY += deltaTime * 100
                    break
                case 'down':
                    moveY -= deltaTime * 100
                    break
            }
            movePosition.x = moveX
            movePosition.y = moveY

            this.node.setPosition(movePosition)
        }
    }
}
