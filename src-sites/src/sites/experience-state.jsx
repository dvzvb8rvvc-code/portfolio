/* shared scroll -> design state mapping for the studio film */
export const COLORS = [
  { k: 'Нюд', hex: '#e2b7ad' },
  { k: 'Молочный', hex: '#f1ebe3' },
  { k: 'Лаванда', hex: '#b9a3f5' },
  { k: 'Бордо', hex: '#7a1f3d' },
]
export const SHAPES = ['Квадрат', 'Овал', 'Миндаль']
export const FINISH = ['Глянец', 'Мат']
export const LAYERS = ['Подготовка', 'База', 'Цвет', 'Топ']
const cl = (v, a, b) => Math.min(b, Math.max(a, v))
export function stateAt(p) {
  const shape = p < 0.12 ? 2 : cl(Math.floor((p - 0.12) / 0.077), 0, 2)
  const color = p < 0.35 ? 3 : cl(Math.floor((p - 0.35) / 0.0575), 0, 3)
  const finish = p > 0.58 && p < 0.69 ? 1 : 0
  const explode = p < 0.1 ? 0.15 : p < 0.58 ? 1 : p < 0.8 ? 1 - (p - 0.58) / 0.22 : 0
  const stage = p < 0.12 ? -1 : p < 0.35 ? 0 : p < 0.58 ? 1 : p < 0.8 ? 2 : 3
  const layer = stage === 0 ? 0 : stage === 1 ? 2 : stage === 2 ? 3 : stage === 3 ? 4 : -1
  return { shape, color, finish, explode, stage, layer }
}
