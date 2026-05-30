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

            <p>{fractal.description}</p>

            <h3>Iteración</h3>

            <p>{iteration.toLocaleString()}</p>

            <h3>Transformaciones</h3>

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

                        <pre>
                            {`[ ${t.a}  ${t.b} ]
[ ${t.c}  ${t.d} ]`}
                        </pre>

                        <p>
                            Determinante:
                            <strong> {det.toFixed(4)}</strong>
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
                    </div>
                );
            })}
        </div>
    );
};