import { FractalConfig } from '../types';

interface Props {
    fractal: FractalConfig;
    iteration: number;
}

const getDeterminant = (
    a: number,
    b: number,
    c: number,
    d: number
) => {
    return a * d - b * c;
};

export const EducationPanel = ({
    fractal,
    iteration,
}: Props) => {
    return (
        <div
            style={{
                width: '320px',
                background: '#0f172a',
                borderLeft: '1px solid #334155',
                padding: '20px',
                overflowY: 'auto'
            }}
        >
            <h2>{fractal.name}</h2>
{/* 
            <p>{fractal.description}</p> */}

            <h3>Iteración</h3>

            <p>{iteration.toLocaleString()}</p>

            <h3>Transformaciones</h3>

            <div
                style={{
                    background: '#1e293b',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '13px',
                    lineHeight: '1.6'
                }}
            >
                <strong>¿Qué significa la matriz?</strong>

                <p>
                    Cada transformación utiliza una matriz:
                </p>

                <pre>
                    {`[ a  b ]
[ c  d ]`}
                </pre>

                <p>
                    Los valores <strong>a</strong> y <strong>d</strong> controlan principalmente
                    el tamaño del fractal.
                </p>

                <p>
                    Los valores <strong>b</strong> y <strong>c</strong> producen rotaciones,
                    inclinaciones y deformaciones.
                </p>

                <p>
                    Los parámetros <strong>e</strong> y <strong>f</strong> desplazan
                    la figura horizontal y verticalmente.
                </p>
            </div>

            {fractal.transforms.map((t, i) => {

                const det = getDeterminant(
                    t.a,
                    t.b,
                    t.c,
                    t.d
                );

                const escala = Math.sqrt(
                    Math.abs(det)
                );

                return (
                    <div
                        key={i}
                        style={{
                            marginBottom: '20px',
                            padding: '10px',
                            border: '1px solid #334155',
                            borderRadius: '8px'
                        }}
                    >
                        <strong>T{i + 1}</strong>

                        {fractal.transformDescriptions?.[i] && (
                            <p
                                style={{
                                    color: '#2dd4bf',
                                    fontSize: '12px'
                                }}
                            >
                                {fractal.transformDescriptions[i]}
                            </p>
                        )}

                        <pre>
                            {`[ ${t.a}  ${t.b} ]
[ ${t.c}  ${t.d} ]`}
                        </pre>

                        <div
                            style={{
                                fontSize: '12px',
                                color: '#94a3b8',
                                marginBottom: '10px'
                            }}
                        >
                            <p><strong>a:</strong> escala horizontal</p>
                            <p><strong>b:</strong> inclinación o rotación</p>
                            <p><strong>c:</strong> inclinación o rotación</p>
                            <p><strong>d:</strong> escala vertical</p>
                            <p><strong>e:</strong> desplazamiento horizontal</p>
                            <p><strong>f:</strong> desplazamiento vertical</p>
                        </div>

                        <p>
                            Determinante:
                            <strong> {det.toFixed(4)}</strong>
                        </p>

                        <p
                            style={{
                                fontSize: '12px',
                                color: '#94a3b8'
                            }}
                        >
                            {Math.abs(det) < 1
                                ? 'Reduce el tamaño de la figura en cada iteración.'
                                : 'Aumenta el tamaño de la figura en cada iteración.'}
                        </p>

                        <p>
                            Escala aproximada:
                            <strong> {escala.toFixed(4)}</strong>
                        </p>

                        <p>
                            {Math.abs(det) < 1
                                ? 'Transformación contractiva'
                                : 'Transformación expansiva'}
                        </p>

                        <p>
                            Traslación:
                            ({t.e}, {t.f})
                        </p>

                        <p>
                            Probabilidad:
                            {(t.probability * 100).toFixed(1)}%
                        </p>

                        <p
                            style={{
                                fontSize: '12px',
                                color: '#94a3b8'
                            }}
                        >
                            Esta transformación será seleccionada aproximadamente
                            {(t.probability * 100).toFixed(1)} veces de cada 100 iteraciones.
                        </p>
                    </div>
                );
            })}
        </div>
    );
};