import {
    _decorator, Component, Vec3,
    Color, Size,
    UITransform, Label, Graphics,
} from 'cc'
const { ccclass, property, } = _decorator

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

type SizeInfo = {
    sizeTime: number
    allTime: number
    size: Size
    curSize: Size
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
    @property(Label)
    private valueLabel: Label | null = null

    @property(Graphics)
    private Body: Graphics | null = null

    private sizeInfo: SizeInfo | null = null

    private moveInfo: MoveInfo | null = null

    protected onLoad() {
        this.init()
        Manager.Instance.eventTarget.emit('boxInstantiate', this)
    }

    protected update(deltaTime: number) {
        this.updateSize(deltaTime)
        this.updatePosition(deltaTime)
    }

    private init() {
    }

    public setAttr({ type, size, position }: BoxAttr) {
        const allTime = Manager.Instance.getMoveTime()

        this.node.setPosition(position)
        this.Body.getComponent(UITransform).setContentSize(size)
        this.Body.fillColor = BOX_TYPE[type]
        // 画圆角矩形
        this.sizeInfo = {
            sizeTime: 0,
            allTime,
            size,
            curSize: new Size(0, 0)
        }

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

        if (type) {
            this.valueLabel.string = type
            this.valueLabel.color = +type > 4 ? new Color('#ffffff') : new Color('#756C63')
            this.Body.fillColor = BOX_TYPE[type] || BOX_TYPE[2048]
            this.Body.fill()
        }
    }

    public updateSize(deltaTime: number) {
        if (!this.sizeInfo) return

        const { sizeTime, allTime, size, curSize } = this.sizeInfo
        const { width, height } = size
        const speedX = width / allTime
        const speedY = height / allTime

        if (sizeTime >= allTime) {
            // 结束
            this.Body.clear()
            this.Body.roundRect(
              -width / 2,  //x
              -height / 2, //y
              width,       //w
              height,      //h
              20,               //r
            )
            this.Body.fill()
            this.sizeInfo = null
        } else {
            // 更新中
            const sWidth = curSize.width + speedX * deltaTime
            const sHeight = curSize.height + speedY * deltaTime
            this.Body.roundRect(
              -sWidth / 2,  //x
              -sHeight / 2, //y
              sWidth,       //w
              sHeight,      //h
              20,               //r
            )
            this.Body.fill()
            this.sizeInfo.curSize = new Size(sWidth, sHeight)
            this.sizeInfo.sizeTime += deltaTime
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
