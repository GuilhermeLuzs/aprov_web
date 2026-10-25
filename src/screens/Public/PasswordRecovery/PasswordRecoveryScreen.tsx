import { Button, FormCard, MauricioMascot } from '../../../components';

export default function PasswordRecoveryScreen() {
  return (
    <FormCard
      title="Recuperar senha"
      description="A recuperação de senha ainda não está disponível nesta versão da APROV."
    >
      <div className="flex justify-center">
        <MauricioMascot mood="confused" size="md" />
      </div>
      <Button label="Voltar para o login" to="/login" variant="outline" fullWidth />
    </FormCard>
  );
}
