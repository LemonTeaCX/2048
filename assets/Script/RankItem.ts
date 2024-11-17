import { _decorator, Component, Node, Sprite, Label, Color } from 'cc';
const { ccclass, property } = _decorator;

import { Manager } from 'db://assets/Script/Manager'

import type { RankItemInfo } from 'db://assets/Script/Type'

const rankMap = {
    0: new Color('#929191'),
    1: new Color('#e57d28'),
    2: new Color('#dcae35'),
    3: new Color('#cab236'),
}

@ccclass('RankItem')
export class RankItem extends Component {
    @property({ type: Sprite, tooltip: '背景色' })
    public Bg: Sprite = null

    @property({ type: Label, tooltip: '排名' })
    public RankLabel: Label = null

    @property({ type: Label, tooltip: '分数' })
    public ScoreLabel: Label = null

    protected onLoad() {
        Manager.Instance.eventTarget.emit('rankItemInstantiate', this)
    }

    setAttr(rankItemInfo: RankItemInfo) {
        const { rank, score } = rankItemInfo

        this.RankLabel.string = rank + ''
        this.RankLabel.color = rankMap[rank] || rankMap[0]
        this.ScoreLabel.string = score + ''
        this.Bg.color = rank % 2 === 0 ? new Color('#343233') : new Color('#2f2e30')
    }
}

