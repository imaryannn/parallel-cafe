export type Point3 = {x:number;y:number;z:number};

/** The trajectory of a narrow jet leaving a spout, accelerated by gravity. */
export function liquidPoint(start:Point3,end:Point3,t:number,initialSpeed=.35):Point3 {
  const drop=Math.max(.001,start.y-end.y),gravity=9.81;
  const duration=(Math.sqrt(initialSpeed*initialSpeed+2*gravity*drop)-initialSpeed)/gravity;
  const elapsed=duration*t;
  return {x:start.x+(end.x-start.x)*t,y:start.y-initialSpeed*elapsed-.5*gravity*elapsed*elapsed,z:start.z+(end.z-start.z)*t};
}

/** Reuses one small mesh; flow narrows as gravity increases its velocity. */
export function createGravityStream(THREE:typeof import('three'),material:import('three').Material) {
  const rows=36,sides=10,positions=new Float32Array((rows+1)*(sides+1)*3),indices:number[]=[];
  for(let row=0;row<rows;row++)for(let side=0;side<sides;side++){
    const a=row*(sides+1)+side,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setIndex(indices);
  const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;
  const tangent=new THREE.Vector3(),sideways=new THREE.Vector3(),other=new THREE.Vector3();
  function update(start:Point3,end:Point3,radius:number,phase:number,head=1,tail=0){
    for(let row=0;row<=rows;row++){
      const t=tail+(head-tail)*row/rows,point=liquidPoint(start,end,t),next=liquidPoint(start,end,Math.min(1,t+.001));
      if(t>.999)tangent.set(end.x-start.x,-Math.max(.1,start.y-end.y)*2,end.z-start.z);else tangent.set(next.x-point.x,next.y-point.y,next.z-point.z);
      tangent.normalize();sideways.set(1,0,0);other.crossVectors(tangent,sideways).normalize();sideways.crossVectors(other,tangent).normalize();
      const width=radius/Math.sqrt(1+t*2.2)*(1+Math.sin(t*27-phase*750)*.045);
      for(let side=0;side<=sides;side++){
        const angle=side/sides*Math.PI*2,a=Math.cos(angle)*width,b=Math.sin(angle)*width,index=(row*(sides+1)+side)*3;
        positions[index]=point.x+sideways.x*a+other.x*b;positions[index+1]=point.y+sideways.y*a+other.y*b;positions[index+2]=point.z+sideways.z*a+other.z*b;
      }
    }
    geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();
  }
  return {mesh,update};
}
