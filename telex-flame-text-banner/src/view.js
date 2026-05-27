
document.addEventListener( 'DOMContentLoaded', () => {
	const blocks = document.querySelectorAll( '.wp-block-telex-block-telex-flame-text-banner' );

	blocks.forEach( ( block ) => {
		const container = block.querySelector( '.telex-flame-text-banner__inner' );
		const canvas = block.querySelector( '.telex-flame-text-banner__canvas' );
		const textEl = block.querySelector( '.telex-flame-text-banner__text' );

		if ( ! container || ! canvas || ! textEl ) {
			return;
		}

		const ctx = canvas.getContext( '2d' );
		if ( ! ctx ) {
			return;
		}

		const flameColorInner = block.dataset.flameColorInner || '#ffdd33';
		const flameColorOuter = block.dataset.flameColorOuter || '#ff4500';

		let particles = [];
		let animationId = null;
		let isVisible = true;

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

		/**
		 * @param {number} x
		 * @param {number} y
		 * @return {{x: number, y: number, vx: number, vy: number, life: number, maxLife: number, size: number}}
		 */
		const createParticle = ( x, y ) => {
			return {
				x: x + ( Math.random() - 0.5 ) * 8,
				y,
				vx: ( Math.random() - 0.5 ) * 1.5,
				vy: -( Math.random() * 3 + 1.5 ),
				life: 0,
				maxLife: Math.random() * 40 + 20,
				size: Math.random() * 6 + 3,
			};
		};

		const innerRgb = hexToRgb( flameColorInner );
		const outerRgb = hexToRgb( flameColorOuter );

		const animate = () => {
			if ( ! isVisible ) {
				animationId = requestAnimationFrame( animate );
				return;
			}

			ctx.clearRect( 0, 0, canvas.width, canvas.height );

			const textRect = textEl.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();
			const textTop = textRect.top - containerRect.top;
			const textLeft = textRect.left - containerRect.left;
			const textWidth = textRect.width;

			for ( let i = 0; i < 3; i++ ) {
				const px = textLeft + Math.random() * textWidth;
				particles.push( createParticle( px, textTop ) );
			}

			particles = particles.filter( ( p ) => {
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

			animationId = requestAnimationFrame( animate );
		};

		const observer = new IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					isVisible = entry.isIntersecting;
				} );
			},
			{ threshold: 0.1 }
		);

		observer.observe( block );
		animate();
	} );
} );
