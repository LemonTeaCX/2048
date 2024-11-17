import {
    _decorator, Component, Node, Prefab, instantiate,
    Label, Button,
    CCInteger, CCFloat,
    EventTarget, EventTouch, input, Input,
    Vec3, Size,
} from 'cc'
const { ccclass, property } = _decorator

import { AudioController } from 'db://assets/Script/AudioController'

import type { BoxIndex, BoxAttr } from 'db://assets/Script/Type'
import { Box } from 'db://assets/Script/Box'
import { Panel } from 'db://assets/Script/Panel'

// 获取 0-num 的随机自然数
const randomInt = (num: number) => Math.floor(Math.random() * (num+1))

type Position = [ number, number ]
const getPosition = (mapSize: [ number, number ], mapGrid: [ number, number ], mapGap: number) => {
    const [ rows, cols ] = mapGrid
    const [ mapWidth, mapHeight ] = mapSize
    // 计算格子的实际宽度和高度，确保格子之间的间距是10，网格边缘距离也为10
    const cellWidth = (mapWidth - (cols + 1) * mapGap) / cols
    const cellHeight = (mapHeight - (rows + 1) * mapGap) / rows
    const positions: Position[][] = []

    // 计算每个格子的中心点坐标
    for (let i = 0; i < rows; i++) {
        const rowPositions: [ number, number ][] = []
        for (let j = 0; j < cols; j++) {
            // 计算格子中心点坐标，考虑到网格边缘的间距
            const x = (j * (cellWidth + mapGap)) + mapGap + (cellWidth / 2) - (mapWidth / 2)
            const y = (i * (cellHeight + mapGap)) + mapGap + (cellHeight / 2) - (mapHeight / 2)
            rowPositions.push([x, -y])
        }
        positions.push(rowPositions)
    }

    return { positions, cellWidth, cellHeight }
}

type Direction = 'left' | 'right' | 'up' | 'down'

@ccclass('Manager')
export class Manager extends Component {
    // manager实例
    private static _instance: Manager = null

    // 事件对象
    public eventTarget = null

    @property({ type: Node, tooltip: '地图背景' })
    private MapBg: Node | null = null

    @property({ type: Prefab, tooltip: '盒子预制体' })
    private Box: Prefab | null = null

    @property({ type: Node, tooltip: '结束模板' })
    private Gameover: Node | null = null

    @property({ type: Label, tooltip: '结束模板分数' })
    private GameoverScoreLabel: Label | null = null

    @property({ type: Node, tooltip: '结束重新开始按钮' })
    private RestartButton: Node | null = null

    // 菜单
    @property({ type: Node, tooltip: '菜单' })
    private Menu: Node | null = null

    @property({ type: Node, tooltip: '继续按钮' })
    private ContinueButton: Node | null = null

    @property({ type: Node, tooltip: '菜单重新开始按钮' })
    private MenuRestartButton: Node | null = null

    @property({ type: Node, tooltip: '关闭音效按钮' })
    private CloseAudioButton: Node | null = null

    @property({ type: [ CCInteger, CCInteger ], tooltip: '地图尺寸' })
    private mapSize: [ number, number ] = [ 640, 640 ]

    @property({ type: [ CCInteger, CCInteger ], tooltip: '地图网格' })
    private mapGrid: [ number, number ] = [ 4, 4 ]

    @property({ type: CCInteger, tooltip: '地图间距' })
    private mapGap: number = 10

    @property({ type: CCFloat, tooltip: '盒子移动过程总时间' })
    private moveTime: number = 0.2

    // 位置信息
    private positionList: Position[][] = []

    // 盒子大小
    private boxSize: Size = new Size(100, 100)

    // 最新生成的盒子属性
    private boxAttr: BoxAttr | null = null

    // 盒子列表
    private boxList: BoxAttr[] = []

    // 面板对象
    private panels: {
        score: Panel | null
        total: Panel | null
    } = {
        'score': null,
        'total': null,
    }
    // 分数
    private score: number = 0

    // 游戏状态
    private gameState: 'playing' | 'menu' | 'over' = 'playing'

    // 是否有音效
    private isAudio: boolean = true

    protected onLoad() {
        this.init()
    }

    protected start() {
    }

    private init() {
        this.initInstance()
        this.initEvent()
        this.initBox()
        this.initState()
    }

    // 初始化实例
    private initInstance() {
        Manager._instance = this
    }
    public static get Instance() {
        return this._instance
    }

    // 初始化游戏状态
    private initState() {
        this.gameState = 'playing'

        // 菜单
        this.Menu.active = false

        // 结束面板隐藏
        this.Gameover.active = false

        // 初始化盒子数量
        this.boxList.forEach(box => {
            this.MapBg.removeChild(box.node)
        })
        this.boxList = []

        // 初始化生成两个 box
        this.randomBox()
        this.randomBox()

        // 分数归 0
        this.score = 0
        this.panels['score']?.setScore(this.score)
    }

    // 初始化事件
    private initEvent() {
        this.eventTarget = new EventTarget()
        this.eventTarget.on('boxInstantiate', (instance: Box) => {
            this.initBoxInstance(instance)
        })
        this.eventTarget.on('panelInstantiate', (instance: Panel) => {
            this.initPanelInstance(instance)
        })

        let isTouching = false // 用于控制每次移动只触发一次
        this.MapBg.on(Node.EventType.TOUCH_START, () => isTouching = false, this)
        this.MapBg.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            if (this.gameState !== 'playing') return
            if (isTouching) return
            isTouching = true

            const { x, y } = event.getUIDelta()

            if (Math.abs(x) > Math.abs(y)) {
                // 左右移动
                this.updateBox(x > 0 ? 'right' : 'left')
            } else {
                // 上下移动
                this.updateBox(y > 0 ? 'up' : 'down')
            }
        }, this)
        input.on(Input.EventType.KEY_DOWN, (event) => {
            if (this.gameState !== 'playing') return

            let direction: Direction = 'left'

            switch (event.keyCode) {
                case 37:
                    direction = 'left'
                    break;
                case 38:
                    direction = 'up'
                    break;
                case 39:
                    direction = 'right'
                    break;
                case 40:
                    direction = 'down'
                    break;
            }

            this.updateBox(direction)
        }, this)

        this.RestartButton.on(Node.EventType.TOUCH_END, this.initState, this)

        // 菜单
        this.ContinueButton.on(Node.EventType.TOUCH_END, () => {
            this.gameState = 'playing'
            this.Menu.active = false
        }, this)
        this.MenuRestartButton.on(Node.EventType.TOUCH_END, () => {
            this.initState()
        })
        this.CloseAudioButton.on(Node.EventType.TOUCH_END, () => {
            this.isAudio = !this.isAudio
            const BtnLabel = this.CloseAudioButton.getChildByName('Label')
            BtnLabel.getComponent(Label).string = this.isAudio ? '关闭音效' : '打开音效'
        })
    }

    // 初始化盒子和位置信息
    private initBox() {
        const { Box, mapSize, mapGrid, mapGap } = this
        const { positions, cellWidth, cellHeight } = getPosition(mapSize, mapGrid, mapGap)

        this.boxSize = new Size(cellWidth, cellHeight)
        this.positionList = positions

        positions.forEach((col, y) => {
            col.forEach((row, x) => {
                const box = instantiate(Box)

                this.boxAttr = {
                    index: [ x, y ],
                    type: 0,
                    position: new Vec3(...row, 0),
                    size: new Size(cellWidth, cellHeight),
                    node: box
                }
                this.MapBg.addChild(box)
            })
        })
    }

    private initBoxInstance(instance: Box) {
        if (this.boxAttr) {
            instance.setAttr(this.boxAttr)
            this.boxAttr.instance = instance

            if (this.boxAttr.type !== 0) {
                this.boxList.push(this.boxAttr)
            }

            this.boxAttr = null
        }
    }

    // 随机生成 1 个盒子
    private randomBox() {
        if (this.boxList.length >= 16) {
            console.log('game over')
            this.gameState = 'over'
            this.Gameover.active = true
            this.GameoverScoreLabel.string = this.score + ''
            return
        }

        let index: BoxIndex = [ randomInt(3), randomInt(3) ]

        while (this.boxList.find(item => item.index.toString() === index.toString())) {
            index = [ randomInt(3), randomInt(3) ]
        }

        const box = instantiate(this.Box)

        this.boxAttr = {
            index,
            type: Math.random() > 0.6 ? 4 : 2,
            position: new Vec3(...this.positionList[index[0]][index[1]], 0),
            size: this.boxSize,
            node: box,
        }
        this.MapBg.addChild(box)
    }

    // 根据方向更新盒子位置与数字
    private updateBox(direction: Direction) {
        const [ row, col ] = this.mapGrid
        let getIndexNum = (x: number, y: number) => ([ x, y ])

        switch (direction) {
            case 'right':
                getIndexNum = (x, y) => ([ y, row-1-x ])
                break
            case 'left':
                getIndexNum = (x, y) => ([ y, x ])
                break
            case 'up':
                getIndexNum = (x, y) => ([ x, y ])
                break
            case 'down':
                getIndexNum = (x, y) => ([ col-1-x, y ])
                break
        }

        Array.from({ length: row }, (_, y) => {
            let line = []
            Array.from({ length: col }, (_, x) => {
                line.push(getIndexNum(x, y))
            })
            this.updateBoxLine(line, direction)
        })

        this.randomBox()
    }
    // 更新每一行盒子位置与数字
    private updateBoxLine(line: BoxIndex[], direction: Direction) {
        let preBox = null
        let preIndex = null
        let isPreConcat = false

        line.forEach((item) => {
            const box = this.boxList.find(boxItem => boxItem.index.toString() === item.toString())

            if (!box) return

            preIndex = preBox ? this.getPreIndex(preBox.index, direction) : line[0]
            const result = this.updateBoxOne(box, preBox, isPreConcat, preIndex, direction)

            isPreConcat = result.isConcat
            preBox = result.box
        })
    }
    // 更新一个盒子位置与数字
    private updateBoxOne(box: BoxAttr, preBox: BoxAttr, isPreConcat: boolean, preIndex: BoxIndex, direction: Direction) {
        let isConcat = false

        // console.log('box1', JSON.stringify(box.index), JSON.stringify(box.position))

        // 合并需要满足的条件：存在上一个盒子 & 上次没有合并过 & type 值相等
        if (preBox && !isPreConcat && box.type === preBox.type) {
            let delIndex = preBox.index

            // 移除第一个 box
            this.boxList = this.boxList.filter(boxItem => boxItem.index.toString() !== delIndex.toString())
            this.MapBg.removeChild(preBox.node)

            // 第二个 box 数值增加
            let prePosition = new Vec3(...this.positionList[delIndex[0]][delIndex[1]], 0)
            box.type = box.type + box.type
            box.index = delIndex
            box.instance.move(direction, prePosition, box.type+'')
            box.position = prePosition

            isConcat = true

            // 更新分数
            this.score += box.type
            this.panels['score'].setScore(this.score)

            this.isAudio && AudioController.Instance.playScore()
        } else {
            // 只需要移动到上个盒子前一个位置
            let prePosition = new Vec3(...this.positionList[preIndex[0]][preIndex[1]], 0)

            box.index = preIndex
            box.instance.move(direction, prePosition)
            box.position = prePosition
            isConcat = false

            this.isAudio && AudioController.Instance.playCreate()
        }

        // console.log('box2', JSON.stringify(box.index), JSON.stringify(box.position))

        return { isConcat, box }
    }
    // 根据方向获取盒子前一个位置
    private getPreIndex(index: BoxIndex, direction: Direction): BoxIndex {
        const [ x, y ] = index
        const [ maxX, maxY ] = this.mapGrid.map(item => item -1)
        let preX = x
        let preY = y

        switch (direction) {
            case 'right':
                preY = y-1 < 0 ? 0 : y-1
                break
            case 'left':
                preY = y+1 > maxY ? maxY : y+1
                break
            case 'up':
                preX = x+1 > maxX ? maxX : x+1
                break
            case 'down':
                preX = x-1 < 0 ? 0 : x-1
                break
        }

        return [ preX, preY ]
    }

    // 移动过程总时间
    public getMoveTime(): number {
        return this.moveTime
    }

    private initPanelInstance(instance: Panel) {
        this.panels[instance.key] = instance
        // 菜单
        this.panels['score'].Button.on(Node.EventType.TOUCH_END, () => {
            this.gameState = 'menu'
            this.Menu.active = true
        }, this)
    }
}
