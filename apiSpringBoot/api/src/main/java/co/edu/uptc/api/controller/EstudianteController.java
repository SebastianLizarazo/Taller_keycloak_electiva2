package co.edu.uptc.api.controller;

import co.edu.uptc.api.model.Estudiante;
import co.edu.uptc.api.repository.EstudianteRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/estudiante")
public class EstudianteController {
    private final EstudianteRepository repo;

    public EstudianteController(EstudianteRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody Estudiante estudiante) {
        repo.save(estudiante);
        return ResponseEntity.created(URI.create("/api/estudiante/" + estudiante.getCodigo())).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Estudiante> get(@PathVariable("id") String id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Estudiante> list() {
        return repo.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        repo.delete(id);
        return ResponseEntity.noContent().build();
    }
}
