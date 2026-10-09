export async function mountForge(root=document,{signal}={}) {
  const host=root.querySelector('[data-forge]');if(!host)return null;
  const {mount}=await import('../language-forge/ui/client.js');
  if(signal?.aborted)return null;
  return mount(host);
}
