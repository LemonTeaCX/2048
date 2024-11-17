import { _decorator, Component, Node, Label, Color } from 'cc';
const { ccclass, property } = _decorator;

import { Manager } from 'db://assets/Script/Manager'

import type { RankItemInfo } from 'db://assets/Script/Type'

@ccclass('RankItem')
export class RankItem extends Component {
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
        this.RankLabel.outlineColor = new Color('#F65E3B')
        this.ScoreLabel.string = score + ''
    }
}

