import {
    Node,
    Vec3, Size, Color,
} from 'cc'
import { Box } from 'db://assets/Script/Box'

export type BoxIndex = [ number, number ]
export type BoxType = Record<number, Color>
export type BoxAttr = {
    index: BoxIndex,
    type?: keyof BoxType
    size?: Size
    position?: Vec3
    node?: Node | null
    instance?: Box | null,
}
