import {
    _decorator, Component, Vec3,
    Color,
    UITransform, Sprite, Label
} from 'cc'
const { ccclass, } = _decorator

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

type MoveInfo = {
    moveTime: number
    allTime: number
    direction: string
    position: BoxAttr['position']
    getPosition: (x: number, y: number, t: number) => [number, number]
}

@ccclass('Box')
export class Box extends Component {
    private valueLabel: Label | null = null
    private boxSprite: Sprite | null = null

    private moveInfo: MoveInfo | null = null

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
        const nowPosition = this.node.getPosition()
        const disX = Math.abs(nowPosition.x - position.x)
        const disY = Math.abs(nowPosition.y - position.y)
        const allTime = Manager.Instance.getMoveTime()
        const speed = (disX || disY) / allTime
        let getPosition: MoveInfo['getPosition'] = (x, y, t) => [ x+(speed*t), y ]

        switch(direction) {
            case 'right':
                getPosition = (x, y, t) => [ x+(speed*t), y ]
                break
            case 'left':
                getPosition = (x, y, t) => [ x-(speed*t), y ]
                break
            case 'up':
                getPosition = (x, y, t) => [ x, y+(speed*t) ]
                break
            case 'down':
                getPosition = (x, y, t) => [ x, y-(speed*t) ]
                break
        }

        this.moveInfo = {
            moveTime: 0,
            allTime,
            direction,
            position,
            getPosition,
        }
        // this.node.setPosition(position)

        if (type) {
            this.valueLabel.string = type
            this.boxSprite.color = BOX_TYPE[type]
        }
    }

    private updatePosition(deltaTime: number) {
        if (!this.moveInfo) return

        const { moveTime, allTime, position, getPosition } = this.moveInfo

        if (moveTime >= allTime) {
            // 结束
            this.node.setPosition(position)
            this.moveInfo = null
        } else {
            // 移动中
            const { x: nowX, y: nowY } = this.node.getPosition()
            const [ moveX, moveY ] = getPosition(nowX, nowY, deltaTime)
            const movePosition = new Vec3(moveX, moveY, 0)

            this.node.setPosition(movePosition)
            this.moveInfo.moveTime += deltaTime
        }
    }
}
