
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	ColorPicker,
	__experimentalText as Text,
} from '@wordpress/components';
import { useEffect, useRef, useCallback } from '@wordpress/element';
import './editor.scss';

const TEXT_SIZE_OPTIONS = [
	{ label: __( 'Small', 'telex-flame-text-banner' ), value: 'small' },
	{ label: __( 'Medium', 'telex-flame-text-banner' ), value: 'medium' },
	{ label: __( 'Large', 'telex-flame-text-banner' ), value: 'large' },
	{ label: __( 'Extra Large', 'telex-flame-text-banner' ), value: 'xlarge' },
];

const TEXT_SIZE_MAP = {
	small: '2rem',
	medium: '3.5rem',
	large: '5rem',
	xlarge: '7rem',
};

/**
 * @param {Object}   props
 * @param {Object}   props.attributes
 * @param {Function} props.setAttributes
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { text, textSize, flameColorInner, flameColorOuter, backgroundColor } = attributes;
	const canvasRef = useRef( null );
	const containerRef = useRef( null );
	const animationRef = useRef( null );
	const particlesRef = useRef( [] );

	const createParticle = useCallback(
		/**
		 * @param {number} x
		 * @param {number} y
		 * @return {{x: number, y: number, vx: number, vy: number, life: number, maxLife: number, size: number}}
		 */
		( x, y ) => {
			return {
				x: x + ( Math.random() - 0.5 ) * 8,
				y,
				vx: ( Math.random() - 0.5 ) * 1.5,
				vy: -( Math.random() * 3 + 1.5 ),
				life: 0,
				maxLife: Math.random() * 40 + 20,
				size: Math.random() * 6 + 3,
			};
		},
		[]
	);

	useEffect( () => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if ( ! canvas || ! container ) {
			return;
		}

		const ctx = canvas.getContext( '2d' );
		if ( ! ctx ) {
			return;
		}

		const resizeCanvas = () => {
			const rect = container.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
		};

		resizeCanvas();

		const resizeObserver = new ResizeObserver( resizeCanvas );
		resizeObserver.observe( container );

		/**
		 * @param {string} hex
		 * @return {{r: number, g: number, b: number}}
		 */
		const hexToRgb = ( hex ) => {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
			return result
				? {
						r: parseInt( result[ 1 ], 16 ),
						g: parseInt( result[ 2 ], 16 ),
						b: parseInt( result[ 3 ], 16 ),
				  }
				: { r: 255, g: 200, b: 50 };
		};

		const animate = () => {
			ctx.clearRect( 0, 0, canvas.width, canvas.height );

			const textEl = container.querySelector( '.telex-flame-text-banner__text' );
			if ( textEl ) {
				const textRect = textEl.getBoundingClientRect();
				const containerRect = container.getBoundingClientRect();
				const textTop = textRect.top - containerRect.top;
				const textLeft = textRect.left - containerRect.left;
				const textWidth = textRect.width;

				for ( let i = 0; i < 3; i++ ) {
					const px = textLeft + Math.random() * textWidth;
					particlesRef.current.push( createParticle( px, textTop ) );
				}
			}

			const innerRgb = hexToRgb( flameColorInner );
			const outerRgb = hexToRgb( flameColorOuter );

			particlesRef.current = particlesRef.current.filter( ( p ) => {
				p.life++;
				if ( p.life > p.maxLife ) {
					return false;
				}

				p.x += p.vx;
				p.y += p.vy;
				p.vx += ( Math.random() - 0.5 ) * 0.3;
				p.vy -= 0.02;

				const lifeRatio = p.life / p.maxLife;
				const alpha = 1 - lifeRatio;
				const currentSize = p.size * ( 1 - lifeRatio * 0.5 );

				const r = Math.round( innerRgb.r + ( outerRgb.r - innerRgb.r ) * lifeRatio );
				const g = Math.round( innerRgb.g + ( outerRgb.g - innerRgb.g ) * lifeRatio );
				const b = Math.round( innerRgb.b + ( outerRgb.b - innerRgb.b ) * lifeRatio );

				ctx.beginPath();
				ctx.arc( p.x, p.y, currentSize, 0, Math.PI * 2 );
				ctx.fillStyle = `rgba(${ r }, ${ g }, ${ b }, ${ alpha * 0.7 })`;
				ctx.fill();

				ctx.beginPath();
				ctx.arc( p.x, p.y, currentSize * 0.5, 0, Math.PI * 2 );
				ctx.fillStyle = `rgba(${ innerRgb.r }, ${ innerRgb.g }, ${ innerRgb.b }, ${ alpha })`;
				ctx.fill();

				return true;
			} );

			animationRef.current = requestAnimationFrame( animate );
		};

		animate();

		return () => {
			if ( animationRef.current ) {
				cancelAnimationFrame( animationRef.current );
			}
			resizeObserver.disconnect();
			particlesRef.current = [];
		};
	}, [ text, textSize, flameColorInner, flameColorOuter, createParticle ] );

	const blockProps = useBlockProps( {
		className: 'telex-flame-text-banner',
		style: {
			backgroundColor,
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Banner Settings', 'telex-flame-text-banner' ) }>
					<TextControl
						label={ __( 'Banner Text', 'telex-flame-text-banner' ) }
						value={ text }
						onChange={ ( value ) => setAttributes( { text: value } ) }
						help={ __( 'Enter the text to display with flame effects.', 'telex-flame-text-banner' ) }
					/>
					<SelectControl
						label={ __( 'Text Size', 'telex-flame-text-banner' ) }
						value={ textSize }
						options={ TEXT_SIZE_OPTIONS }
						onChange={ ( value ) => setAttributes( { textSize: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Flame Colors', 'telex-flame-text-banner' ) } initialOpen={ false }>
					<Text variant="muted" style={ { marginBottom: '8px', display: 'block' } }>
						{ __( 'Inner Flame Color', 'telex-flame-text-banner' ) }
					</Text>
					<ColorPicker
						color={ flameColorInner }
						onChange={ ( value ) => setAttributes( { flameColorInner: value } ) }
						enableAlpha={ false }
					/>
					<Text variant="muted" style={ { marginBottom: '8px', marginTop: '16px', display: 'block' } }>
						{ __( 'Outer Flame Color', 'telex-flame-text-banner' ) }
					</Text>
					<ColorPicker
						color={ flameColorOuter }
						onChange={ ( value ) => setAttributes( { flameColorOuter: value } ) }
						enableAlpha={ false }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Background', 'telex-flame-text-banner' ) } initialOpen={ false }>
					<Text variant="muted" style={ { marginBottom: '8px', display: 'block' } }>
						{ __( 'Background Color', 'telex-flame-text-banner' ) }
					</Text>
					<ColorPicker
						color={ backgroundColor }
						onChange={ ( value ) => setAttributes( { backgroundColor: value } ) }
						enableAlpha={ false }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<div className="telex-flame-text-banner__inner" ref={ containerRef }>
					<canvas className="telex-flame-text-banner__canvas" ref={ canvasRef } />
					<span
						className="telex-flame-text-banner__text"
						style={ { fontSize: TEXT_SIZE_MAP[ textSize ] || '5rem' } }
					>
						{ text }
					</span>
				</div>
			</div>
		</>
	);
}
