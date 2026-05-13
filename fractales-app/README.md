# Generador de Fractales IFS

Aplicación web interactiva paravisualizar fractales generados mediante el método de Sistemas de Funciones Iteradas (IFS).

## 🎯 Características

- **5 fractales predefinidos**: Helecho de Barnsley, Triángulo de Sierpinski, Curva del Dragón, Curva de Lévy, Árbol Fractal
- **Animación en tiempo real**: El fractal se construye progresivamente punto a punto
- **Editor avanzado**: Modifica las transformaciones afines (matrices 2x2 + vectores de traslación)
- **Controles de exploración**: Zoom in/out yreset de vista
- **Renderizado eficiente**: Canvas API para mejor rendimiento

## 🧮 Conceptos Matemáticos

Un IFS define un fractal mediante un conjunto de transformaciones afines:

```
[x'] = a*x + b*y + e
[y'] = c*x + d*y + f
```

Donde la matriz 2x2 `[[a,b],[c,d]]` controla rotación y escala, y el vector `[e,f]` controla traslación.

## 🚀 Instalación

```bash
cd fractales-app
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## 📁 Estructura

```
src/
├── components/
│   ├── FractalCanvas.tsx   # Renderizado del fractal
│   ├── Controls.tsx       # Panel de control
│   └── TransformEditor.tsx # Editor de matrices
├── data/
│   └── fractals.ts        # Configuraciones predefinidas
├── hooks/
│   ├── useIFSAnimation.ts    # Animación IFS
│   └── useCanvasTransform.ts # Zoom/pan
├── types/
│   └── index.ts          # Tipos TypeScript
├── utils/
│   ├── ifsEngine.ts     # Motor matemático
│   └── canvasUtils.ts  # Coordenadas
├── App.tsx
├── main.tsx
└── index.css
```

## 🎨 Uso

1. Selecciona un fractal del menú desplegable
2. Presiona **Iniciar** para comenzar la animación
3. Ajusta el número de iteraciones y velocidad
4. Usa las opciones avanzadas para modificar transformaciones
5. Navega con zoom (+/-) yreset de vista

## 📦 Dependencias

- React 19
- Vite 8
- TypeScript