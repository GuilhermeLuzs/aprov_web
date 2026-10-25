import { Star } from 'lucide-react';
import mauricio from '../../../assets/mauricios/mauricio-banner.webp';
import { Container } from '../../../components';
import { icon } from '../../../theme';

const STARS = [1, 2, 3, 4, 5];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-r from-primary to-primary-bright text-surface">
      <div className="star-pattern absolute inset-zero" aria-hidden />

      <Container
        width="wide"
        className="relative grid gap-xl pt-xxxl lg:grid-cols-12 lg:items-start lg:gap-xxxl lg:pt-section"
      >
        <div className="flex w-fit flex-col gap-lg lg:order-2 lg:col-span-7">
          <h1 className="border-b-4 border-surface pb-md font-display font-extrabold text-banner-sm uppercase italic md:text-banner-md xl:text-banner-lg">
            <span className="block">Sua avaliação</span>
            <span className="flex items-center gap-sm">
              Vale
              <span className="flex gap-xs" aria-hidden>
                {STARS.map((star) => (
                  <Star
                    key={star}
                    strokeWidth={icon.strokeWidthThin}
                    className="h-banner-star-sm w-banner-star-sm md:h-banner-star-md md:w-banner-star-md xl:h-banner-star-lg xl:w-banner-star-lg"
                  />
                ))}
              </span>
            </span>
            <span className="block">mais na APROV</span>
          </h1>

          <p className="w-zero min-w-full font-display font-semibold text-subtitle italic md:text-title">
            Transforme suas avaliações em <strong className="font-extrabold uppercase">descontos</strong>{' '}
            nas empresas parceiras e em{' '}
            <strong className="font-extrabold uppercase">credibilidade</strong> no seu perfil.
          </p>
        </div>

        <div className="mx-auto aspect-banner-mascot w-full max-w-banner-mascot-sm overflow-hidden md:max-w-banner-mascot-md lg:order-1 lg:col-span-5 lg:max-w-none">
          <img
            src={mauricio}
            alt="Maurício, o robô da APROV, acenando"
            className="h-full w-full object-cover object-top"
          />
        </div>
      </Container>
    </section>
  );
}
